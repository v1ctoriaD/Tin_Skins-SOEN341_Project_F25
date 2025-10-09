//IMPORTANT! This is only temporary!

import { faker } from '@faker-js/faker';
import Decimal from 'decimal.js';

// --- 7 Organizations ---
export const organizations = Array.from({ length: 7 }).map((_, i) => ({
  id: i + 1,
  authId: faker.string.uuid(),
  email: `org${i + 1}@example.com`,
  orgName: faker.company.name(),
  isApproved: true,
  createdAt: new Date(),
  updatedAt: new Date(),
}));

// --- 10 Users ---
export const users = Array.from({ length: 10 }).map((_, i) => ({
  id: i + 1,
  authId: faker.string.uuid(),
  email: `user${i + 1}@example.com`,
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  role: 'USER',
  createdAt: new Date(),
  updatedAt: new Date(),
}));

// --- 30 Events ---
export const events = Array.from({ length: 30 }).map((_, i) => {
  const randomOrg = faker.helpers.arrayElement(organizations);
  const tags = faker.helpers.arrayElements([
    "WORKSHOP","SEMINAR","LECTURE","STUDY_SESSION","HACKATHON","BOOTCAMP","RESEARCH_SYMPOSIUM",
    "COMPETITION","EXAM_PREP","TUTORING","CAREER_FAIR","INFO_SESSION","NETWORKING","RESUME_CLINIC"
  ], faker.number.int({ min: 2, max: 5 }));

  return {
    id: i + 1,
    title: faker.company.catchPhrase(),
    description: faker.lorem.paragraph(),
    cost: new Decimal(faker.number.int({ min: 0, max: 50 })),
    maxAttendees: faker.number.int({ min: 20, max: 100 }),
    date: faker.date.soon({ days: faker.number.int({ min: 5, max: 120 }) }),
    locationName: faker.location.city(),
    latitude: faker.location.latitude(),
    longitude: faker.location.longitude(),
    imageUrl: "https://placehold.co/600x400",
    tags: tags,
    eventOwnerId: randomOrg.id,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
});