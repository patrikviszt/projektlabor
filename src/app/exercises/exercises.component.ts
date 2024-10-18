import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

interface Exercise {
  name: string;
}

interface Exercises {
  chest: Exercise[];
  shoulder: Exercise[];
  biceps: Exercise[];
  triceps: Exercise[];
  forearm: Exercise[];
  leg: Exercise[];
  abs: Exercise[];
  back: Exercise[];
  trapezius: Exercise[];
  cardio: Exercise[];
}

@Component({
  selector: 'app-exercises',
  templateUrl: './exercises.component.html',
  styleUrls: ['./exercises.component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class ExercisesComponent {
  exercises: Exercises = {
    chest: [
      { name: 'Fekvenyomás' },
      { name: 'Ferde padon nyomás' },
      { name: 'Kábeles keresztbehúzás' },
    ],
    shoulder: [
      { name: 'Vállból nyomás' },
      { name: 'Oldalemelés' },
      { name: 'Előre emelés' },
    ],
    biceps: [
      { name: 'Bicepsz hajlítás' },
      { name: 'Kábeles bicepsz hajlítás' },
      { name: 'Hammer curl' },
    ],
    triceps: [
      { name: 'Tricepsz nyomás' },
      { name: 'Kábeles tricepsz nyújtás' },
      { name: 'Tricepsz fekvenyomás' },
    ],
    forearm: [
      { name: 'Forearm flexion' },
      { name: 'Reverse wrist curl' },
    ],
    leg: [
      { name: 'Guggolás' },
      { name: 'Kitörés' },
      { name: 'Lábtoló' },
    ],
    abs: [
      { name: 'Hasprés' },
      { name: 'Plank' },
      { name: 'Lábemelés' },
    ],
    back: [
      { name: 'Húzódzkodás' },
      { name: 'Evezés' },
      { name: 'Deadlift' },
    ],
    trapezius: [
      { name: 'Vállrándítás' },
      { name: 'Kábeles hátrahúzás' },
    ],
    cardio: [
      { name: 'Futás' },
      { name: 'Kerékpározás' },
      { name: 'Evezés' },
    ],
  };

  visibleGroups: { [key: string]: boolean } = {};

  toggleGroup(group: keyof Exercises) {
    this.visibleGroups[group] = !this.visibleGroups[group];
  }

  getExerciseGroups(): (keyof Exercises)[] {
    return Object.keys(this.exercises) as (keyof Exercises)[];
  }
}
