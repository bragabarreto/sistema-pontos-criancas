import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { children, customActivities, settings } from '@/lib/schema';

const defaultActivities = {
  positivos: [
    { id: 'pos1', name: 'Escovar os dentes', points: 1 },
    { id: 'pos2', name: 'Arrumar a cama', points: 1 },
    { id: 'pos3', name: 'Fazer lição de casa', points: 2 },
    { id: 'pos4', name: 'Ajudar a organizar brinquedos', points: 1 }
  ],
  especiais: [
    { id: 'esp1', name: 'Ajudar em casa sem pedir', points: 1 },
    { id: 'esp2', name: 'Nota boa na escola', points: 2 },
    { id: 'esp3', name: 'Comportamento exemplar', points: 1 }
  ],
  negativos: [
    { id: 'neg1', name: 'Não escovar os dentes', points: -1 },
    { id: 'neg2', name: 'Bagunçar o quarto', points: -1 },
    { id: 'neg3', name: 'Não fazer lição de casa', points: -2 }
  ],
  graves: [
    { id: 'gra1', name: 'Desobedecer', points: -1 },
    { id: 'gra2', name: 'Mentir', points: -2 },
    { id: 'gra3', name: 'Brigar com irmão/irmã', points: -1 }
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
