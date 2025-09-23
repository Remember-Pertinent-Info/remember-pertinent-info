import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  await prisma.concept.createMany({
    data: [
      { code: "COLORS",   name: "Colors",   description: "Recognizing and naming basic colors like red, blue, and yellow." },
      { code: "SHAPES",   name: "Shapes",   description: "Identifying simple shapes such as circle, square, and triangle." },
      { code: "COUNTING", name: "Counting", description: "Understanding numbers 1 through 10 and how to count objects." },
      { code: "ALPHABET", name: "Alphabet", description: "Knowing the letters A through Z and their sounds." },
      { code: "OPPOSITES",name: "Opposites",description: "Learning pairs like big/small, hot/cold, up/down." },
      { code: "DAYS",     name: "Days of the Week", description: "Remembering the seven days and their order." },
      { code: "SEASONS",  name: "Seasons",  description: "Recognizing spring, summer, fall, and winter." },
      { code: "FEELINGS", name: "Feelings", description: "Identifying basic emotions such as happy, sad, and angry." },
      { code: "SAFETY",   name: "Safety Basics", description: "Understanding simple safety rules like looking both ways before crossing the street." },
      { code: "MANNERS",  name: "Manners",  description: "Saying please, thank you, and taking turns during play." }
    ],
    skipDuplicates: true
  });
  console.log("Seeded kindergarten concepts.");

  await prisma.skill.createMany({
    data: [
      { code: 'OBSERVE', name: 'Observation', description: 'Noticing details and patterns in the environment.' },
      { code: 'COMPARE', name: 'Comparison', description: 'Identifying similarities and differences.' },
      { code: 'CLASSIFY', name: 'Classification', description: 'Grouping objects by attributes.' },
    ],
    skipDuplicates: true,
  });
  console.log('Seeded sample skills.');

  await prisma.course.createMany({
    data: [
      { code: 'K-ARTS', name: 'Kindergarten Arts', description: 'Introduction to colors, shapes, and creative expression.' },
      { code: 'K-MATH', name: 'Kindergarten Math', description: 'Counting, sorting, and simple number concepts.' },
      { code: 'K-READ', name: 'Kindergarten Reading', description: 'Early literacy, alphabet recognition, and phonics.' },
    ],
    skipDuplicates: true,
  });
  console.log('Seeded sample courses.');

  await prisma.track.createMany({
    data: [
      { code: 'FOUND', name: 'Foundations', description: 'Broad early-learning track covering basic cognitive and social skills.' },
      { code: 'LIT', name: 'Early Literacy', description: 'Focused track on reading readiness and communication.' },
    ],
    skipDuplicates: true,
  });
  console.log('Seeded sample tracks.');

  await prisma.department.createMany({
    data: [
      { code: 'EARLY-ED', name: 'Early Education', description: 'Department overseeing kindergarten and early learning programs.' },
      { code: 'STEM', name: 'STEM', description: 'Science, Technology, Engineering, and Mathematics department.' },
    ],
    skipDuplicates: true,
  });
  console.log('Seeded sample departments.');

  await prisma.major.createMany({
    data: [
      { code: 'EDU-K', name: 'Early Childhood Education', description: 'Major focused on foundational teaching practices.' },
      { code: 'DESIGN', name: 'Creative Design', description: 'Major centered around visual and creative arts learning.' },
    ],
    skipDuplicates: true,
  });
  console.log('Seeded sample majors.');

  // Create example links between entities
  const [deptEarlyEd, deptSTEM] = await Promise.all([
    prisma.department.findFirst({ where: { code: 'EARLY-ED' } }),
    prisma.department.findFirst({ where: { code: 'STEM' } }),
  ]);

  const [majorEduK, majorDesign] = await Promise.all([
    prisma.major.findFirst({ where: { code: 'EDU-K' } }),
    prisma.major.findFirst({ where: { code: 'DESIGN' } }),
  ]);

  const [trackFound, trackLit] = await Promise.all([
    prisma.track.findFirst({ where: { code: 'FOUND' } }),
    prisma.track.findFirst({ where: { code: 'LIT' } }),
  ]);

  const [courseArts, courseMath, courseRead] = await Promise.all([
    prisma.course.findFirst({ where: { code: 'K-ARTS' } }),
    prisma.course.findFirst({ where: { code: 'K-MATH' } }),
    prisma.course.findFirst({ where: { code: 'K-READ' } }),
  ]);

  // Assign majors to departments
  if (deptEarlyEd && majorEduK) {
    await prisma.major.update({ where: { id: majorEduK.id }, data: { departmentId: deptEarlyEd.id } });
  }
  if (deptSTEM && majorDesign) {
    await prisma.major.update({ where: { id: majorDesign.id }, data: { departmentId: deptSTEM.id } });
  }

  // Link majors to courses
  if (majorEduK && courseArts && courseRead) {
    await prisma.major.update({
      where: { id: majorEduK.id },
      data: { courses: { connect: [{ id: courseArts.id }, { id: courseRead.id }] } },
    });
  }
  if (majorDesign && courseArts && courseMath) {
    await prisma.major.update({
      where: { id: majorDesign.id },
      data: { courses: { connect: [{ id: courseArts.id }, { id: courseMath.id }] } },
    });
  }

  // Link majors to tracks
  if (majorEduK && trackFound && trackLit) {
    await prisma.major.update({
      where: { id: majorEduK.id },
      data: { tracks: { connect: [{ id: trackFound.id }, { id: trackLit.id }] } },
    });
  }
  if (majorDesign && trackFound) {
    await prisma.major.update({
      where: { id: majorDesign.id },
      data: { tracks: { connect: [{ id: trackFound.id }] } },
    });
  }

  // Link tracks to courses
  if (trackFound && courseArts && courseMath) {
    await prisma.track.update({
      where: { id: trackFound.id },
      data: { courses: { connect: [{ id: courseArts.id }, { id: courseMath.id }] } },
    });
  }
  if (trackLit && courseRead) {
    await prisma.track.update({
      where: { id: trackLit.id },
      data: { courses: { connect: [{ id: courseRead.id }] } },
    });
  }
  console.log('Linked departments↔majors, majors↔courses, majors↔tracks, tracks↔courses.');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
