// //Seeding file - DON'T RUN!

// import { faker } from '@faker-js/faker';
// import Decimal from 'decimal.js';
// import prisma from './prisma.js';
// import { getAllTags, createUser, createOrganization, signIn} from './database.js';
// import supabase from './supabase.js';
// import fs from 'fs';

// export async function main() {
//   console.log("Starting database seed...");

//   console.log("Uploading default image to Supabase storage...");
//   const imageBuffer = fs.readFileSync('./database/EventPlaceholder.png');
//   const fileName = `seed_default_${Date.now()}.png`;

//   const { data: uploadData, error: uploadError } = await supabase.storage
//     .from('event-images')
//     .upload(fileName, imageBuffer, {
//       contentType: 'image/png',
//       upsert: true,
//     });

//   if (uploadError) {
//     console.error("Failed to upload default image:", uploadError.message);
//     process.exit(1);
//   }

//   const { data: publicUrlData } = supabase.storage
//     .from('event-images')
//     .getPublicUrl('default_event_image.png');

//   const defaultImageUrl = publicUrlData.publicUrl;
//   console.log("Default image uploaded:", defaultImageUrl);

//   // --- 1. Create ADMIN user ---
//   console.log("Creating admin account...");
//   const adminEmail = "admin@eventplatform.com";
//   const adminPassword = "Admin123!";
//   const adminFirstName = "Admin";
//   const adminLastName = "User";

//   const adminSession = await createUser(adminEmail, adminPassword, adminFirstName, adminLastName, "ADMIN");
//   if (!adminSession) {
//     console.warn("Admin already exists or failed to create.");
//   } else {
//     console.log("Admin account created:", adminEmail);
//   }

//   // --- 2. Create 7 organizations ---
//   console.log("Creating organizations...");
//   const organizations = [];
//   for (let i = 0; i < 7; i++) {
//     const email = `org${i + 1}@example.com`;
//     const password = "Password123!";
//     const orgName = faker.company.name();

//     const session = await createOrganization(email, password, orgName, true);
//     if (!session) {
//       console.warn(`Organization ${email} already exists or failed.`);
//       continue;
//     }
//     const org = await prisma.organization.findUnique({ where: { email } });
//     organizations.push({ ...org, session });
//   }
//   console.log(`Created ${organizations.length} organizations`);
//   /**const organizations = [];
//   for (let i = 0; i < 7; i++) {
//     const email = `org${i + 1}@example.com`;
//     const password = "Password123!";

//     const session = await signIn(email, password);
//     if (!session) {
//       console.warn(`Organization ${email} already exists or failed.`);
//       continue;
//     }
//     const org = await prisma.organization.findUnique({ where: { email } });
//     organizations.push({ ...org, session });
//   }
//   console.log(`Created ${organizations.length} organizations`);*/

//   // --- 3. Create 10 random users ---
//   console.log("Creating users...");
//   const users = [];
//   for (let i = 0; i < 10; i++) {
//     const email = `user${i + 1}@example.com`;
//     const password = "Password123!";
//     const firstName = faker.person.firstName();
//     const lastName = faker.person.lastName();

//     const session = await createUser(email, password, firstName, lastName);
//     if (!session) {
//       console.warn(`User ${email} already exists or failed.`);
//       continue;
//     }
//     const user = await prisma.user.findUnique({ where: { email } });
//     users.push({ ...user, session });
//   }
//   console.log(`Created ${users.length} users`);
//   /**const users = [];
//   for (let i = 0; i < 10; i++) {
//     const email = `user${i + 1}@example.com`;
//     const password = "Password123!";

//     const session = await signIn(email, password);
//     if (!session) {
//       console.warn(`User ${email} already exists or failed.`);
//       continue;
//     }
//     const user = await prisma.user.findUnique({ where: { email } });
//     users.push({ ...user, session });
//   }
//   console.log(users)
//   console.log(`Created ${users.length} users`); */

//   // --- 4. Create 30 random events ---
//   console.log("Creating events...");
//   const tags = getAllTags();
//   const today = new Date();

//   for (let i = 0; i < 30; i++) {
//     const randomOrg = faker.helpers.arrayElement(organizations);
//     if (!randomOrg) continue;

//     const title = faker.company.catchPhrase();
//     const description = faker.lorem.paragraph();
//     const cost = faker.number.int({ min: 0, max: 50 });
//     const maxAttendees = faker.number.int({ min: 20, max: 100 });
//     const date = faker.date.soon({ days: faker.number.int({ min: 5, max: 120 }), refDate: today });
//     const locationName = faker.location.city();
//     const latitude = faker.location.latitude();
//     const longitude = faker.location.longitude();
//     const imageFile = new Blob(); // Placeholder (no upload in seed)
//     const selectedTags = faker.helpers.arrayElements(tags, faker.number.int({ min: 2, max: 5 }));

//     try {
//       await prisma.event.create({
//         data: {
//           title,
//           description,
//           cost: new Decimal(cost),
//           maxAttendees,
//           date,
//           locationName,
//           latitude,
//           longitude,
//           imageUrl: defaultImageUrl, // placeholder image
//           tags: selectedTags,
//           eventOwnerId: randomOrg.id,
//         },
//       });
//       console.log(`Event ${i + 1} created`);
//     } catch (err) {
//       console.error("Failed to create event:", err.message);
//     }
//   }

//   // --- 5. Registering users to events ---

//   console.log("Registering users to events...");

//   const allEvents = await prisma.event.findMany();
//   let successfulRegistrations = 0;

//   for (const user of users) {
//     // Each user registers to between 2–5 random events
//     const numRegistrations = faker.number.int({ min: 2, max: 5 });
//     const selectedEvents = faker.helpers.arrayElements(allEvents, numRegistrations);

//     for (const event of selectedEvents) {
//       const success = await db.registerToEvent(user.session, event.id);
//       if (success) successfulRegistrations++;
//     }
//   }

//   console.log(`Successfully registered users to ${successfulRegistrations} events total.`);

//   console.log("Seeding complete!");
// }

// // Run the seeding script
// seed.main()
//   .then(async () => {
//     await prisma.$disconnect();
//   })
//   .catch(async (e) => {
//     console.error(e);
//     await prisma.$disconnect();
//     process.exit(1);
//   });
