import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { children, customActivities, activities, settings } from '@/lib/schema';
import { eq } from 'drizzle-orm';

/**
 * Import data from the old localStorage-based system
 * Expected format matches the structure from app.html
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { luiza, miguel, multipliers } = body;

    // Create or update children
    const childrenData = [];
    
    if (luiza) {
      // Check if child exists
      const existingLuiza = await db.select().from(children).where(eq(children.name, 'Luiza'));
      let luizaChild;
      
      if (existingLuiza.length > 0) {
        const [updated] = await db.update(children)
          .set({
            initialBalance: luiza.initialBalance || 0,
            totalPoints: luiza.totalPoints || 0,
            startDate: luiza.startDate ? new Date(luiza.startDate) : null,
            updatedAt: new Date(),
          })
          .where(eq(children.id, existingLuiza[0].id))
          .returning();
        luizaChild = updated;
      } else {
        const [created] = await db.insert(children).values({
          name: 'Luiza',
          initialBalance: luiza.initialBalance || 0,
          totalPoints: luiza.totalPoints || 0,
          startDate: luiza.startDate ? new Date(luiza.startDate) : null,
        }).returning();
        luizaChild = created;
      }
      
      childrenData.push({ name: 'Luiza', data: luiza, dbId: luizaChild.id });
    }

    if (miguel) {
      // Check if child exists
      const existingMiguel = await db.select().from(children).where(eq(children.name, 'Miguel'));
      let miguelChild;
      
      if (existingMiguel.length > 0) {
        const [updated] = await db.update(children)
          .set({
            initialBalance: miguel.initialBalance || 0,
            totalPoints: miguel.totalPoints || 0,
            startDate: miguel.startDate ? new Date(miguel.startDate) : null,
            updatedAt: new Date(),
          })
          .where(eq(children.id, existingMiguel[0].id))
          .returning();
        miguelChild = updated;
      } else {
        const [created] = await db.insert(children).values({
          name: 'Miguel',
          initialBalance: miguel.initialBalance || 0,
          totalPoints: miguel.totalPoints || 0,
          startDate: miguel.startDate ? new Date(miguel.startDate) : null,
        }).returning();
        miguelChild = created;
      }
      
      childrenData.push({ name: 'Miguel', data: miguel, dbId: miguelChild.id });
    }

    // Import custom activities
    let customActivitiesCount = 0;
    for (const childData of childrenData) {
      const childInfo = childData.data;
      if (childInfo.customActivities) {
        for (const [category, items] of Object.entries(childInfo.customActivities)) {
          const itemsArray = items as any[];
          for (const item of itemsArray) {
            try {
              await db.insert(customActivities).values({
                childId: childData.dbId,
                activityId: item.id || `${childData.name.toLowerCase()}-${Date.now()}-${Math.random()}`,
                name: item.name,
                points: item.points,
                category,
              });
              customActivitiesCount++;
            } catch (e) {
              // Activity might already exist, skip
              console.log('Skipping duplicate custom activity');
            }
          }
        }
      }
    }

    // Import activity history
    let activitiesCount = 0;
    for (const childData of childrenData) {
      const childInfo = childData.data;
      if (childInfo.activities && Array.isArray(childInfo.activities)) {
        for (const activity of childInfo.activities) {
          try {
            await db.insert(activities).values({
              childId: childData.dbId,
              name: activity.name,
              points: activity.points,
              category: activity.category || 'positivos',
              multiplier: activity.multiplier || 1,
              date: activity.date ? new Date(activity.date) : new Date(),
            });
            activitiesCount++;
          } catch (e) {
            console.error('Error importing activity:', e);
          }
        }
      }
    }

    // Import multipliers
    if (multipliers) {
      const existingSettings = await db.select().from(settings).where(eq(settings.key, 'multipliers'));
      
      if (existingSettings.length > 0) {
        await db.update(settings)
          .set({
            value: multipliers,
            updatedAt: new Date(),
          })
          .where(eq(settings.key, 'multipliers'));
      } else {
        await db.insert(settings).values({
          key: 'multipliers',
          value: multipliers,
        });
      }
    }

    return NextResponse.json({
      message: 'Data imported successfully',
      children: childrenData.length,
      customActivities: customActivitiesCount,
      activities: activitiesCount,
      multipliersImported: !!multipliers,
    });
  } catch (error) {
    console.error('Error importing data:', error);
    return NextResponse.json({ 
      error: 'Failed to import data', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
