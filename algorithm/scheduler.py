#!/usr/bin/env python3
"""
Smart Exam Scheduler Algorithm
Supports:
- CSP (heuristic greedy constraint scheduling)
- Hybrid CSP + Genetic Algorithm (GA-optimized subject ordering)
"""

import json
import random
import sys
from collections import defaultdict
from datetime import datetime, timedelta


class ExamScheduler:
    def __init__(
        self,
        subjects,
        students,
        halls,
        teachers,
        start_date,
        exclude_dates,
        algorithm_mode='csp',
        ga_population=30,
        ga_generations=25,
        ga_mutation_rate=0.12,
        random_seed=42,
    ):
        self.subjects = subjects
        self.students = students
        self.halls = sorted(halls, key=lambda hall: hall['capacity'])
        self.teachers = teachers
        self.start_date = datetime.strptime(start_date, '%Y-%m-%d')
        self.exclude_dates = set(exclude_dates)

        self.algorithm_mode = algorithm_mode
        self.ga_population = max(8, int(ga_population))
        self.ga_generations = max(3, int(ga_generations))
        self.ga_mutation_rate = max(0.01, min(0.8, float(ga_mutation_rate)))
        self.random = random.Random(random_seed)

        self.slots = [
            "9:00 AM - 12:00 PM",
            "2:00 PM - 5:00 PM",
        ]

        self.subject_lookup = {subject['code']: subject for subject in subjects}
        self.hall_capacity_map = {hall['hallId']: hall['capacity'] for hall in halls}

        self.student_subjects = defaultdict(set)
        for student in students:
            for subject_code in student.get('subjects', []):
                self.student_subjects[student['studentId']].add(subject_code)

        self.subject_students = {}
        for subject in subjects:
            self.subject_students[subject['code']] = set(subject.get('studentsEnrolled', []))

        self.timetable = []
        self.unscheduled_subjects = []
        self.last_metrics = {}

        self._reset_runtime()

    def _reset_runtime(self):
        self.timetable = []
        self.used_slots = defaultdict(list)  # (date, slot) -> subject_codes
        self.used_halls = defaultdict(set)  # (date, slot) -> hall_ids
        self.teacher_assignments = {}  # (date, slot, hall_id) -> teacher_id
        self.teacher_load = defaultdict(int)
        self.unscheduled_subjects = []

    def is_weekend(self, date_obj):
        return date_obj.weekday() in [5, 6]

    def is_excluded(self, date_obj):
        return date_obj.strftime('%Y-%m-%d') in self.exclude_dates

    def iter_working_days(self, start_date_obj, max_days=220):
        current = start_date_obj
        steps = 0
        while steps < max_days:
            if not self.is_weekend(current) and not self.is_excluded(current):
                yield current
            current += timedelta(days=1)
            steps += 1

    def slot_label(self, slot):
        if slot == self.slots[0]:
            return 'morning'
        return 'afternoon'

    def get_slot_order(self, subject):
        preferred = subject.get('preferredSlot', 'any')
        if preferred == 'morning':
            return [self.slots[0], self.slots[1]]
        if preferred == 'afternoon':
            return [self.slots[1], self.slots[0]]
        return list(self.slots)

    def has_student_conflict(self, subject_code, date_str, slot):
        key = (date_str, slot)
        if key not in self.used_slots:
            return False

        students_in_subject = self.subject_students.get(subject_code, set())
        for scheduled_subject in self.used_slots[key]:
            scheduled_students = self.subject_students.get(scheduled_subject, set())
            if students_in_subject & scheduled_students:
                return True
        return False

    def find_suitable_hall(self, subject, date_str, slot):
        required_capacity = len(subject.get('studentsEnrolled', []))
        key = (date_str, slot)
        occupied_halls = self.used_halls[key]

        for hall in self.halls:
            if hall['hallId'] in occupied_halls:
                continue
            if hall['capacity'] >= required_capacity:
                return hall
        return None

    def assign_invigilator(self, date_str, slot):
        if not self.teachers:
            return None

        slot_teachers = set()
        for (assigned_date, assigned_slot, _), teacher_id in self.teacher_assignments.items():
            if assigned_date == date_str and assigned_slot == slot:
                slot_teachers.add(teacher_id)

        available_teachers = [
            teacher for teacher in self.teachers
            if teacher['teacherId'] not in slot_teachers
        ]
        if not available_teachers:
            return None

        # Prefer the least loaded invigilator for fairness.
        available_teachers.sort(
            key=lambda teacher: (
                self.teacher_load[teacher['teacherId']],
                teacher['teacherId']
            )
        )
        selected_teacher = available_teachers[0]
        self.teacher_load[selected_teacher['teacherId']] += 1
        return selected_teacher['teacherId']

    def schedule_subject(self, subject):
        subject_code = subject['code']
        slot_order = self.get_slot_order(subject)

        for date_obj in self.iter_working_days(self.start_date):
            date_str = date_obj.strftime('%Y-%m-%d')
            for slot in slot_order:
                if self.has_student_conflict(subject_code, date_str, slot):
                    continue

                hall = self.find_suitable_hall(subject, date_str, slot)
                if not hall:
                    continue

                invigilator = self.assign_invigilator(date_str, slot)

                exam = {
                    'subject_code': subject_code,
                    'subject_name': subject['name'],
                    'date': date_str,
                    'slot': slot,
                    'hall': hall['hallId'],
                    'hall_name': hall['name'],
                    'invigilator': invigilator,
                    'semester': subject['semester'],
                    'department': subject['department'],
                    'students_count': len(subject.get('studentsEnrolled', [])),
                }
                self.timetable.append(exam)

                usage_key = (date_str, slot)
                self.used_slots[usage_key].append(subject_code)
                self.used_halls[usage_key].add(hall['hallId'])
                if invigilator:
                    self.teacher_assignments[(date_str, slot, hall['hallId'])] = invigilator
                return True
        return False

    def build_schedule_from_order(self, ordered_subjects):
        self._reset_runtime()

        for subject in ordered_subjects:
            is_scheduled = self.schedule_subject(subject)
            if not is_scheduled:
                self.unscheduled_subjects.append(subject['code'])

        metrics = self.calculate_metrics()
        return list(self.timetable), metrics

    def calculate_metrics(self):
        scheduled_count = len(self.timetable)
        unscheduled_count = len(self.unscheduled_subjects)

        if scheduled_count == 0:
            return {
                'scheduled_count': 0,
                'unscheduled_count': unscheduled_count,
                'unscheduled_subjects': list(self.unscheduled_subjects),
                'day_span': 0,
                'load_variance': 0.0,
                'preference_hits': 0,
                'preference_total': 0,
                'hall_utilization': 0.0,
            }

        date_values = [
            datetime.strptime(exam['date'], '%Y-%m-%d') for exam in self.timetable
        ]
        day_span = (max(date_values) - min(date_values)).days + 1

        exams_per_day = defaultdict(int)
        for exam in self.timetable:
            exams_per_day[exam['date']] += 1

        loads = list(exams_per_day.values())
        avg_load = sum(loads) / len(loads)
        load_variance = sum((load - avg_load) ** 2 for load in loads) / len(loads)

        preference_hits = 0
        preference_total = 0
        for exam in self.timetable:
            subject = self.subject_lookup.get(exam['subject_code'])
            preferred = subject.get('preferredSlot', 'any') if subject else 'any'
            if preferred in ['morning', 'afternoon']:
                preference_total += 1
                if preferred == self.slot_label(exam['slot']):
                    preference_hits += 1

        utilization_ratios = []
        for exam in self.timetable:
            hall_capacity = self.hall_capacity_map.get(exam['hall'], 0)
            if hall_capacity > 0:
                utilization_ratios.append(exam['students_count'] / hall_capacity)
        hall_utilization = (
            sum(utilization_ratios) / len(utilization_ratios)
            if utilization_ratios else 0.0
        )

        return {
            'scheduled_count': scheduled_count,
            'unscheduled_count': unscheduled_count,
            'unscheduled_subjects': list(self.unscheduled_subjects),
            'day_span': day_span,
            'load_variance': load_variance,
            'preference_hits': preference_hits,
            'preference_total': preference_total,
            'hall_utilization': hall_utilization,
        }

    def fitness_score(self, metrics):
        score = 0.0
        score += metrics['scheduled_count'] * 220.0
        score -= metrics['unscheduled_count'] * 1300.0
        score -= metrics['day_span'] * 6.0
        score -= metrics['load_variance'] * 10.0
        score += metrics['preference_hits'] * 20.0
        score += metrics['hall_utilization'] * 120.0
        return score

    def ordered_crossover(self, parent_a, parent_b):
        size = len(parent_a)
        if size < 2:
            return list(parent_a)

        left = self.random.randint(0, size - 2)
        right = self.random.randint(left + 1, size - 1)

        child = [None] * size
        child[left:right + 1] = parent_a[left:right + 1]

        fill_values = [gene for gene in parent_b if gene not in child]
        fill_index = 0
        for index in range(size):
            if child[index] is None:
                child[index] = fill_values[fill_index]
                fill_index += 1
        return child

    def mutate(self, chromosome):
        if len(chromosome) < 2:
            return chromosome

        if self.random.random() <= self.ga_mutation_rate:
            first = self.random.randint(0, len(chromosome) - 1)
            second = self.random.randint(0, len(chromosome) - 1)
            chromosome[first], chromosome[second] = chromosome[second], chromosome[first]
        return chromosome

    def tournament_select(self, ranked_population, size=3):
        candidates = self.random.sample(ranked_population, k=min(size, len(ranked_population)))
        candidates.sort(key=lambda item: item['score'], reverse=True)
        return candidates[0]['chromosome']

    def generate_csp_schedule(self):
        ordered = sorted(
            self.subjects,
            key=lambda subject: len(subject.get('studentsEnrolled', [])),
            reverse=True,
        )
        timetable, metrics = self.build_schedule_from_order(ordered)
        self.last_metrics = metrics
        return timetable

    def generate_hybrid_schedule(self):
        if len(self.subjects) <= 2:
            return self.generate_csp_schedule()

        base_order = sorted(
            [subject['code'] for subject in self.subjects],
            key=lambda code: len(self.subject_lookup[code].get('studentsEnrolled', [])),
            reverse=True,
        )

        population = [base_order[:]]
        while len(population) < self.ga_population:
            candidate = base_order[:]
            self.random.shuffle(candidate)
            population.append(candidate)

        evaluation_cache = {}
        best_solution = None

        def evaluate(chromosome):
            key = tuple(chromosome)
            if key in evaluation_cache:
                return evaluation_cache[key]

            ordered_subjects = [self.subject_lookup[code] for code in chromosome]
            timetable, metrics = self.build_schedule_from_order(ordered_subjects)
            score = self.fitness_score(metrics)
            evaluation = {
                'chromosome': list(chromosome),
                'score': score,
                'timetable': list(timetable),
                'metrics': metrics,
            }
            evaluation_cache[key] = evaluation
            return evaluation

        for _ in range(self.ga_generations):
            ranked_population = [evaluate(chromosome) for chromosome in population]
            ranked_population.sort(key=lambda item: item['score'], reverse=True)

            if best_solution is None or ranked_population[0]['score'] > best_solution['score']:
                best_solution = ranked_population[0]

            elites = [ranked_population[0]['chromosome'][:]]
            if len(ranked_population) > 1:
                elites.append(ranked_population[1]['chromosome'][:])

            next_population = elites[:]
            while len(next_population) < self.ga_population:
                parent_a = self.tournament_select(ranked_population)
                parent_b = self.tournament_select(ranked_population)
                child = self.ordered_crossover(parent_a, parent_b)
                child = self.mutate(child)
                next_population.append(child)

            population = next_population

        final_order = best_solution['chromosome']
        final_subjects = [self.subject_lookup[code] for code in final_order]
        final_timetable, final_metrics = self.build_schedule_from_order(final_subjects)
        self.last_metrics = final_metrics
        return final_timetable

    def generate_schedule(self):
        if self.algorithm_mode == 'hybrid-ga':
            return self.generate_hybrid_schedule()
        return self.generate_csp_schedule()

    def get_statistics(self):
        if not self.timetable:
            return {
                'algorithm_mode': self.algorithm_mode,
                'total_exams': 0,
                'unscheduled_count': len(self.unscheduled_subjects),
                'unscheduled_subjects': list(self.unscheduled_subjects),
            }

        dates = [exam['date'] for exam in self.timetable]
        departments = {exam['department'] for exam in self.timetable}
        total_students = sum(exam['students_count'] for exam in self.timetable)

        return {
            'algorithm_mode': self.algorithm_mode,
            'total_exams': len(self.timetable),
            'total_days': len(set(dates)),
            'total_departments': len(departments),
            'total_students_exams': total_students,
            'start_date': min(dates),
            'end_date': max(dates),
            'unscheduled_subjects': list(self.unscheduled_subjects),
            'unscheduled_count': len(self.unscheduled_subjects),
            'hall_utilization': round(self.last_metrics.get('hall_utilization', 0.0), 4),
            'preference_hits': self.last_metrics.get('preference_hits', 0),
            'preference_total': self.last_metrics.get('preference_total', 0),
        }


def main():
    try:
        input_data = json.load(sys.stdin)

        scheduler = ExamScheduler(
            subjects=input_data['subjects'],
            students=input_data['students'],
            halls=input_data['halls'],
            teachers=input_data.get('teachers', []),
            start_date=input_data['startDate'],
            exclude_dates=input_data.get('excludeDates', []),
            algorithm_mode=input_data.get('algorithmMode', 'csp'),
            ga_population=input_data.get('gaPopulation', 30),
            ga_generations=input_data.get('gaGenerations', 25),
            ga_mutation_rate=input_data.get('gaMutationRate', 0.12),
            random_seed=input_data.get('randomSeed', 42),
        )

        timetable = scheduler.generate_schedule()
        stats = scheduler.get_statistics()

        result = {
            'success': True,
            'algorithm': {
                'mode': scheduler.algorithm_mode,
                'gaPopulation': scheduler.ga_population,
                'gaGenerations': scheduler.ga_generations,
                'gaMutationRate': scheduler.ga_mutation_rate,
            },
            'timetable': timetable,
            'stats': stats,
        }
        print(json.dumps(result, indent=2))
    except Exception as error:
        error_result = {
            'success': False,
            'error': str(error),
        }
        print(json.dumps(error_result, indent=2))
        sys.exit(1)


if __name__ == '__main__':
    main()
