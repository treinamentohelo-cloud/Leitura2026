
import { Student, Assessment, SchoolClass, Competency } from "./types";

export const MOCK_CLASSES: SchoolClass[] = [
  { id: 'c1', name: 'Turma 2A', gradeLevel: '2º Ano', year: 2024, teacher: 'Prof. Marcos Oliveira' },
  { id: 'c2', name: 'Turma 2B', gradeLevel: '2º Ano', year: 2024, teacher: 'Profa. Ana Costa' },
  { id: 'c3', name: 'Turma 3A', gradeLevel: '3º Ano', year: 2024, teacher: 'Prof. Ricardo Silva' },
];

export const MOCK_STUDENTS: Student[] = [
  { id: '1', name: 'Alice Silva', classId: 'c1', readingLevel: 'Em Desenvolvimento', avatarUrl: 'https://picsum.photos/seed/alice/200', inRemedial: true, remedialStartDate: '2024-05-01' },
  { id: '2', name: 'Bernardo Costa', classId: 'c1', readingLevel: 'Fluente', avatarUrl: 'https://picsum.photos/seed/bernardo/200' },
  { id: '3', name: 'Carla Dias', classId: 'c2', readingLevel: 'Iniciante', avatarUrl: 'https://picsum.photos/seed/carla/200', inRemedial: true, remedialStartDate: '2024-05-15' },
  { id: '4', name: 'Davi Oliveira', classId: 'c3', readingLevel: 'Fluente', avatarUrl: 'https://picsum.photos/seed/davi/200' },
  { id: '5', name: 'Elena Souza', classId: 'c2', readingLevel: 'Avançado', avatarUrl: 'https://picsum.photos/seed/elena/200' },
];

export const MOCK_COMPETENCIES: Competency[] = [
  { id: 'comp1', name: 'Fluência de Leitura', description: 'Capacidade de ler com ritmo e entonação.', category: 'Leitura', weight: 40 },
  { id: 'comp2', name: 'Compreensão de Texto', description: 'Habilidade de interpretar e responder sobre o lido.', category: 'Leitura', weight: 30 },
  { id: 'comp3', name: 'Raciocínio Lógico', description: 'Capacidade de resolver problemas estruturados.', category: 'Matemática', weight: 20 },
  { id: 'comp4', name: 'Trabalho em Equipe', description: 'Interação e colaboração com colegas.', category: 'Socioemocional', weight: 10 },
];

export const MOCK_ASSESSMENTS: Assessment[] = [
  { 
    id: '101', 
    studentId: '1', 
    date: '2024-02-15', 
    textTitle: 'O Gato de Botas', 
    wpm: 45, 
    accuracy: 88, 
    comprehension: 6, 
    notes: 'Leitura silabada em palavras trissílabas.',
    criteria: {
      fluency: 'Básico',
      decoding: 'Insuficiente',
      comprehension: 'Adequado',
      math: {
        numberSense: true,
        logicReasoning: false,
        operations: true,
        geometry: false
      }
    }
  },
  { 
    id: '102', 
    studentId: '1', 
    date: '2024-03-10', 
    textTitle: 'A Cigarra e a Formiga', 
    wpm: 52, 
    accuracy: 91, 
    comprehension: 7, 
    notes: 'Melhora na velocidade e decodificação.',
    criteria: {
      fluency: 'Adequado',
      decoding: 'Adequado',
      comprehension: 'Adequado',
      math: {
        numberSense: true,
        logicReasoning: true,
        operations: true,
        geometry: true
      }
    }
  },
];
