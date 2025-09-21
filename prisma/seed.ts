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
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
