-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "EventTag" AS ENUM ('WORKSHOP', 'SEMINAR', 'LECTURE', 'STUDY_SESSION', 'HACKATHON', 'BOOTCAMP', 'RESEARCH_SYMPOSIUM', 'COMPETITION', 'EXAM_PREP', 'TUTORING', 'CAREER_FAIR', 'INFO_SESSION', 'NETWORKING', 'RESUME_CLINIC', 'INTERVIEW_PREP', 'INTERNSHIP_FAIR', 'COMPANY_VISIT', 'PANEL_DISCUSSION', 'ALUMNI_MEETUP', 'ENTREPRENEURSHIP', 'PARTY', 'MIXER', 'CLUB_FAIR', 'GAME_NIGHT', 'MOVIE_NIGHT', 'CULTURAL_FESTIVAL', 'CONCERT', 'TALENT_SHOW', 'STUDENT_GALA', 'SPORTS_GAME', 'FUNDRAISER', 'CHARITY_EVENT', 'CLEANUP_DRIVE', 'BLOOD_DRIVE', 'VOLUNTEERING', 'AWARENESS_CAMPAIGN', 'DONATION_DRIVE', 'MENTORSHIP', 'MEDITATION', 'YOGA', 'FITNESS_CLASS', 'MENTAL_HEALTH', 'SELF_DEVELOPMENT', 'MINDFULNESS', 'NUTRITION_TALK', 'COUNSELING_SESSION', 'CODING_CHALLENGE', 'TECH_TALK', 'AI_ML_WORKSHOP', 'STARTUP_PITCH', 'ROBOTICS_DEMO', 'CYBERSECURITY', 'PRODUCT_SHOWCASE', 'CULTURAL_NIGHT', 'LANGUAGE_EXCHANGE', 'INTERNATIONAL_MEETUP', 'PRIDE_EVENT', 'HERITAGE_CELEBRATION', 'INCLUSION_WORKSHOP', 'ART_EXHIBIT', 'PHOTOGRAPHY_CONTEST', 'FILM_SCREENING', 'THEATER_PLAY', 'OPEN_MIC', 'DANCE_PERFORMANCE', 'MUSIC_JAM', 'ECO_WORKSHOP', 'RECYCLING_DRIVE', 'CLIMATE_TALK', 'GREEN_TECH', 'TREE_PLANTING', 'SUSTAINABILITY', 'FREE_ENTRY', 'PAID_EVENT', 'ON_CAMPUS', 'OFF_CAMPUS', 'VIRTUAL', 'HYBRID', 'FOOD_PROVIDED', 'CERTIFICATE_AVAILABLE', 'TEAM_EVENT', 'SOLO_EVENT');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "authId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" SERIAL NOT NULL,
    "authId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "orgName" TEXT NOT NULL,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "cost" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "maxAttendees" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "tags" "EventTag"[],
    "locationName" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "imageUrl" TEXT,
    "eventOwnerId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_EventAttendees" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_EventAttendees_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_authId_key" ON "User"("authId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_authId_idx" ON "User"("authId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_authId_key" ON "Organization"("authId");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_email_key" ON "Organization"("email");

-- CreateIndex
CREATE INDEX "Organization_authId_idx" ON "Organization"("authId");

-- CreateIndex
CREATE INDEX "Organization_email_idx" ON "Organization"("email");

-- CreateIndex
CREATE INDEX "Event_id_idx" ON "Event"("id");

-- CreateIndex
CREATE INDEX "_EventAttendees_B_index" ON "_EventAttendees"("B");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_eventOwnerId_fkey" FOREIGN KEY ("eventOwnerId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventAttendees" ADD CONSTRAINT "_EventAttendees_A_fkey" FOREIGN KEY ("A") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventAttendees" ADD CONSTRAINT "_EventAttendees_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
