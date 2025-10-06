import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { children, customActivities, settings } from '@/lib/schema';

const defaultActivities = {
  positivos: [
    { id: 'pos1', name: 'Chegar cedo na escola', points: 1 },
    { id: 'pos2', name: 'Chegar bem cedo na escola', points: 2 },
    { id: 'pos3', name: 'Fazer a tarefa sozinho', points: 2 },
    { id: 'pos4', name: 'Ajudar o irmão a fazer a tarefa', points: 2 },
    { id: 'pos5', name: 'Comer toda a refeição', points: 1 },
    { id: 'pos6', name: 'Comer frutas ou verduras', points: 1 },
    { id: 'pos7', name: 'Dormir cedo', points: 1 },
    { id: 'pos8', name: 'Limpeza e saúde', points: 1 },
    { id: 'pos9', name: 'Organização', points: 1 }
  ],
  especiais: [
    { id: 'esp1', name: 'Ler um livro', points: 1 },
    { id: 'esp2', name: 'Tirar nota 10', points: 1 },
    { id: 'esp3', name: 'Viagem - \'se virar\'', points: 1 },
    { id: 'esp4', name: 'Comida especial', points: 1 },
    { id: 'esp5', name: 'Coragem', points: 1 },
    { id: 'esp6', name: 'Ações especiais', points: 1 }
  ],
  negativos: [
    { id: 'neg1', name: 'Chegar atrasado na escola', points: -1 },
    { id: 'neg2', name: 'Não fazer a tarefa', points: -2 },
    { id: 'neg3', name: 'Não comer toda a refeição', points: -1 },
    { id: 'neg4', name: 'Brigar com o irmão', points: -1 },
    { id: 'neg5', name: 'Dar trabalho para dormir', points: -1 },
    { id: 'neg6', name: 'Desobedecer os adultos', points: -2 },
    { id: 'neg7', name: 'Falar bobeira', points: -1 },
    { id: 'neg8', name: 'Gritar', points: -1 }
  ],
  graves: [
    { id: 'gra1', name: 'Bater no irmão', points: -1 },
    { id: 'gra2', name: 'Falar palavrão', points: -1 },
    { id: 'gra3', name: 'Mentir', points: -2 }
  ]
};

export async function POST() {
  try {
    // Create children
    const [luiza, miguel] = await db.insert(children).values([
      {
        name: 'Luiza',
        initialBalance: 0,
        totalPoints: 0,
        startDate: new Date(),
      },
      {
        name: 'Miguel',
        initialBalance: 0,
        totalPoints: 0,
        startDate: new Date(),
      }
    ]).returning();

    // Create custom activities for both children
    const activitiesToInsert = [];
    
    for (const child of [luiza, miguel]) {
      for (const [category, items] of Object.entries(defaultActivities)) {
        for (const item of items) {
          activitiesToInsert.push({
            childId: child.id,
            activityId: `${child.name.toLowerCase()}-${item.id}`,
            name: item.name,
            points: item.points,
            category,
          });
        }
      }
    }

    await db.insert(customActivities).values(activitiesToInsert);

    // Create default multipliers
    await db.insert(settings).values({
      key: 'multipliers',
      value: {
        positivos: 1,
        especiais: 50,
        negativos: 1,
        graves: 100
      }
    });

    return NextResponse.json({
      message: 'Database initialized successfully',
      children: [luiza, miguel],
      activities: activitiesToInsert.length,
    });
  } catch (error) {
    console.error('Error initializing database:', error);
    return NextResponse.json({ error: 'Failed to initialize database', details: error }, { status: 500 });
  }
}
