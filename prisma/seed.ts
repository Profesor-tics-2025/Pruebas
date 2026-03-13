import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create demo user
  const user = await prisma.user.upsert({
    where: { id: "demo-user" },
    update: {},
    create: {
      id: "demo-user",
      name: "Docente Demo",
      email: "docente@demo.com",
      configuration: {
        create: {
          maxHoursPerWeek: 30,
          availableDays: "1,2,3,4,5",
          minHourlyRate: 25,
          preferredModality: "both",
          dailyMaxHours: 8,
        },
      },
    },
  });

  // Create training entities
  const entity1 = await prisma.trainingEntity.create({
    data: { name: "Fundación Tecnológica", contact: "María García", email: "maria@fundtec.es" },
  });
  const entity2 = await prisma.trainingEntity.create({
    data: { name: "Academia Digital Plus", contact: "Carlos López", email: "carlos@adplus.es" },
  });
  const entity3 = await prisma.trainingEntity.create({
    data: { name: "Centro de Formación Innovar", contact: "Ana Martín", email: "ana@innovar.es" },
  });

  // Create courses
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const course1 = await prisma.course.create({
    data: {
      userId: user.id,
      entityId: entity1.id,
      name: "Desarrollo Web con React",
      modality: "presencial",
      cityOrPlatform: "Madrid",
      startDate: new Date(year, month, 1),
      endDate: new Date(year, month + 1, 15),
      totalHours: 60,
      schedule: "L-V 9:00-14:00",
      hourlyRate: 35,
      status: "confirmado",
    },
  });

  const course2 = await prisma.course.create({
    data: {
      userId: user.id,
      entityId: entity2.id,
      name: "Python para Data Science",
      modality: "online",
      cityOrPlatform: "Zoom",
      startDate: new Date(year, month - 1, 15),
      endDate: new Date(year, month, 20),
      totalHours: 40,
      schedule: "M-J 16:00-19:00",
      hourlyRate: 30,
      status: "confirmado",
    },
  });

  const course3 = await prisma.course.create({
    data: {
      userId: user.id,
      entityId: entity3.id,
      name: "Introducción a la IA",
      modality: "hibrido",
      cityOrPlatform: "Barcelona",
      startDate: new Date(year, month + 1, 1),
      endDate: new Date(year, month + 2, 30),
      totalHours: 80,
      totalPrice: 3200,
      schedule: "L-V 10:00-14:00",
      status: "pendiente",
    },
  });

  const course4 = await prisma.course.create({
    data: {
      userId: user.id,
      entityId: entity1.id,
      name: "JavaScript Avanzado",
      modality: "presencial",
      cityOrPlatform: "Madrid",
      startDate: new Date(year, month - 2, 1),
      endDate: new Date(year, month - 1, 28),
      totalHours: 50,
      hourlyRate: 32,
      status: "finalizado",
    },
  });

  // Create sessions for course1
  const sessionsData = [];
  let sessionDate = new Date(year, month, 1);
  for (let i = 0; i < 12; i++) {
    // Skip weekends
    while (sessionDate.getDay() === 0 || sessionDate.getDay() === 6) {
      sessionDate.setDate(sessionDate.getDate() + 1);
    }
    sessionsData.push({
      courseId: course1.id,
      date: new Date(sessionDate),
      startTime: "09:00",
      endTime: "14:00",
      content: `Módulo ${i + 1}: ${["Introducción a React", "JSX y Componentes", "Props y State", "Hooks", "useEffect", "Context API", "React Router", "Formularios", "API REST", "Testing", "Optimización", "Proyecto final"][i]}`,
      status: i < 5 ? "impartida" : "pendiente",
    });
    sessionDate.setDate(sessionDate.getDate() + 1);
  }

  await prisma.session.createMany({ data: sessionsData });

  // Create sessions for course2
  const sessions2 = [];
  let date2 = new Date(year, month - 1, 15);
  for (let i = 0; i < 8; i++) {
    while (date2.getDay() !== 2 && date2.getDay() !== 4) {
      date2.setDate(date2.getDate() + 1);
    }
    sessions2.push({
      courseId: course2.id,
      date: new Date(date2),
      startTime: "16:00",
      endTime: "19:00",
      content: `Sesión ${i + 1}: ${["Intro Python", "NumPy", "Pandas", "Matplotlib", "Scikit-learn", "ML Basics", "Deep Learning", "Proyecto"][i]}`,
      status: i < 6 ? "impartida" : "pendiente",
    });
    date2.setDate(date2.getDate() + 1);
  }

  await prisma.session.createMany({ data: sessions2 });

  // Create offers
  await prisma.courseOffer.create({
    data: {
      userId: user.id,
      entityId: entity2.id,
      courseName: "DevOps y CI/CD",
      startDate: new Date(year, month + 2, 1),
      endDate: new Date(year, month + 3, 15),
      schedule: "L-X 9:00-13:00",
      totalHours: 48,
      hourlyRate: 40,
      modality: "online",
      cityOrPlatform: "Teams",
      status: "recibida",
    },
  });

  await prisma.courseOffer.create({
    data: {
      userId: user.id,
      entityId: entity3.id,
      courseName: "Ciberseguridad Básica",
      startDate: new Date(year, month + 1, 10),
      endDate: new Date(year, month + 2, 10),
      schedule: "L-V 15:00-18:00",
      totalHours: 60,
      hourlyRate: 28,
      modality: "presencial",
      cityOrPlatform: "Valencia",
      status: "evaluando",
    },
  });

  await prisma.courseOffer.create({
    data: {
      userId: user.id,
      entityId: entity1.id,
      courseName: "TypeScript Profesional",
      startDate: new Date(year, month + 3, 1),
      endDate: new Date(year, month + 4, 30),
      schedule: "M-J 10:00-14:00",
      totalHours: 64,
      hourlyRate: 35,
      modality: "hibrido",
      cityOrPlatform: "Madrid",
      status: "recibida",
    },
  });

  console.log("Seed data created successfully!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
