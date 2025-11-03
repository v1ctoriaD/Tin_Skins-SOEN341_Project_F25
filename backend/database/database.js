// THIS FILE CONTAINS ALL THE FUNCTIONS THAT YOU MAY NEED TO CALL TO GET STUFF FROM THE DATABASE
import supabase from "./supabase.js";
import prisma from "./prisma.js";
import Decimal from "decimal.js";

/**
 * Get a single event by ID with all related data
 * @param {number|string} eventId - The ID of the event to retrieve
 * @returns {Promise<Object|null>} The event object or null if not found
 */
export async function getEventById(eventId) {
  try {
    const id = Number(eventId);
    if (!Number.isInteger(id)) return null;
    
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        eventOwner: true,
        eventAttendees: true,
        tickets: true,
      },
    });
    return event;
  } catch (err) {
    console.error("getEventById error:", err);
    return null;
  }
}

/**
 * 
 * @returns a list of all the possible filter tags
 */
export function getAllTags () {
    return ["WORKSHOP","SEMINAR","LECTURE","STUDY_SESSION","HACKATHON","BOOTCAMP","RESEARCH_SYMPOSIUM","COMPETITION","EXAM_PREP","TUTORING","CAREER_FAIR","INFO_SESSION","NETWORKING","RESUME_CLINIC","INTERVIEW_PREP","INTERNSHIP_FAIR","COMPANY_VISIT","PANEL_DISCUSSION","ALUMNI_MEETUP","ENTREPRENEURSHIP","PARTY","MIXER","CLUB_FAIR","GAME_NIGHT","MOVIE_NIGHT","CULTURAL_FESTIVAL","CONCERT","TALENT_SHOW","STUDENT_GALA","SPORTS_GAME","FUNDRAISER","CHARITY_EVENT","CLEANUP_DRIVE","BLOOD_DRIVE","VOLUNTEERING","AWARENESS_CAMPAIGN","DONATION_DRIVE","MENTORSHIP","MEDITATION","YOGA","FITNESS_CLASS","MENTAL_HEALTH","SELF_DEVELOPMENT","MINDFULNESS","NUTRITION_TALK","COUNSELING_SESSION","CODING_CHALLENGE","TECH_TALK","AI_ML_WORKSHOP","STARTUP_PITCH","ROBOTICS_DEMO","CYBERSECURITY","PRODUCT_SHOWCASE","CULTURAL_NIGHT","LANGUAGE_EXCHANGE","INTERNATIONAL_MEETUP","PRIDE_EVENT","HERITAGE_CELEBRATION","INCLUSION_WORKSHOP","ART_EXHIBIT","PHOTOGRAPHY_CONTEST","FILM_SCREENING","THEATER_PLAY","OPEN_MIC","DANCE_PERFORMANCE","MUSIC_JAM","ECO_WORKSHOP","RECYCLING_DRIVE","CLIMATE_TALK","GREEN_TECH","TREE_PLANTING","SUSTAINABILITY","FREE_ENTRY","PAID_EVENT","ON_CAMPUS","OFF_CAMPUS","VIRTUAL","HYBRID","FOOD_PROVIDED","CERTIFICATE_AVAILABLE","TEAM_EVENT","SOLO_EVENT"];
}

/**
 * Creates a new user
 * @param {String} email 
 * @param {String} password 
 * @param {String} firstName 
 * @param {String} lastName 
 * @param {String} role default: 'USER' //please don't change unless for 'ADMIN'
 * @returns user session: { 
    access_token: "...",  
    refresh_token: "...",
    expires_in: 3600,
    user: { id: "...", email: "..." }
   } 
    or null id user already exists
 */
export async function createUser(email, password, firstName, lastName, role='USER') {
    //register user to auth from supabase
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    });
    /**const { data, error } = await supabase.auth.admin.createUser({
        email: email,
        password,
        email_confirm: true
    }); */ //Only used for seeding - unsafe

    if(error) {
        console.error("Sign-up error:", error.message);
        return null;
    }

    //create user in User table
    await prisma.user.create({
        data: {
            authId: data.user.id,
            email: email,
            firstName: firstName,
            lastName: lastName,
        }
    })
    return data.session;
}

/**
 * Creates an new organization
 * @param {String} email 
 * @param {String} password 
 * @param {String} orgName 
 * @param {Boolean} isApproved default=false. please don't change
 * @returns user session: { 
    access_token: "...",  
    refresh_token: "...",
    expires_in: 3600,
    user: { id: "...", email: "..." }
   } 
    or null id organization already exists
 */
export async function createOrganization(email, password, orgName, isApproved=false) {
    //register user/organization to auth from supabase
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    });
    /**const { data, error } = await supabase.auth.admin.createUser({
        email: email,
        password,
        email_confirm: true
    });*/ //Only used for seeding - unsafe

    if(error) {
        console.error("Sign-up error:", error.message);
        return null;
    }

    //create user in Organization in table
    await prisma.organization.create({
        data: {
            authId: data.user.id,
            email: email,
            orgName: orgName,
            isApproved: isApproved
        }
    })
    return data.session;
}

/**
 * SignsIn a user using email and password
 * @param {String} email 
 * @param {String} password 
 * @returns user session: { 
    access_token: "...",  
    refresh_token: "...",
    expires_in: 3600,
    user: { id: "...", email: "..." }
   } 
    or null if there is an error in the signin data
 */
export async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
    });
    if(error) {
        return null;
    }
    return data.session;
}

/**
 * Signs out the current user in terms of making their access_token invalid
 * @returns false if there was an error, true if signOut successful
 */
export async function signOut() {
    const {error} = await supabase.auth.signOut();
    return error ? false : true;
}

/**
 * Creates a new Event
 * @param {String} title 
 * @param {String} description 
 * @param {Float} cost 
 * @param {Integer} maxAttendees 
 * @param {Date} date 
 * @param {String} locationName 
 * @param {Float} latitude 
 * @param {Float} longitude 
 * @param {} image 
 * @param {*} tags //from getAllTags() list
 * @param {*} session //session object
 * @param {*} imageFile //png file
 * @returns true if successfull and false if fails
 */
export async function createEvent(title, description, cost, maxAttendees, date, locationName, latitude, longitude, image=null, tags=null, session, imageFile) {
    //add image to db to get imageUrl
    const fileName = `user_${Date.now()}.png`
    const { data, error } = await supabase.storage.from('user-images').upload(fileName, file)
    if (error) { 
        console.error(error)
        return false;
    }
    const { data: publicUrlData } = supabase.storage.from('user-images').getPublicUrl(fileName);
    const imageUrl = publicUrlData.publicUrl;
    
    //get owner id
    const organization = await getOrganization(session);
    const eventOwnerId = organization.id;

    //create event
    const event = await prisma.event.create({
        data: {
            title: title,
            description: description,
            cost: new Decimal(new Number(cost)),
            maxAttendees: maxAttendees,
            date: date,
            locationName: locationName,
            latitude: latitude,
            longitude: longitude,
            imageUrl: imageUrl,
            tags: tags,
            eventOwnerId: eventOwnerId
        }
    }); 

    return true;
}

/**
 * Deletes a user based on id from table
 * @param {String} authId (user id from authentication)
 * @returns true if successful and false on failure to delete
 */
export async function deleteUser(authId) {
    try {
        const deleted = await prisma.user.delete({
            where: { authId: authId }
        });
        console.log("Deleted:", deleted);
    } catch (error) {
        console.log("Not a user - can't delete");
        return false;
    }
    
    const { data, error } = await supabase.auth.admin.deleteUser(authId);
    if(error) {
        console.error("Failed to delete user:", error.message);
        return false;
    }

    return true;
}

/**
 * Deletes an organization based on id from table
 * @param {String} authId (user id from authentication)
 * @returns true if successful and false on failure to delete
 */
export async function deleteOrganization(authId) {
    try {
        const deleted = await prisma.organization.delete({
            where: { authId: authId }
        });
        console.log("Deleted:", deleted);
    } catch (error) {
        console.log("Not an organization - can't delete");
        return false;
    }

    const { data, error } = await supabase.auth.admin.deleteUser(authId);
    if(error) {
        console.error("Failed to delete user:", error.message);
        return false;
    }

    return true;
}

/**
 * Deletes an event based on the id param provided
 * @param {String} eventId from event
 * @returns true if successfull and false in case of failure
 */
export async function deleteEvent(eventId) {
    try {
        const deleted = await prisma.event.delete({
            where: { id: eventId}
        });
    } catch(error) {
        console.log("Failed to delete event");
        return false;
    }
    return true;
}

/**
 * Updates an event listing depending on given input fields
 * @param {String} eventId 
 * @param {*} updatedFields //object with fields matching those in schema.prisma for what is to be updated
 * @returns true if success and false if fail
 */
export async function updateEvent(eventId, updatedFields) {
  try {
    await prisma.event.update({
      where: { id: eventId },
      data: {
        ...updatedFields,
        updatedAt: new Date(),
      },
    });
    return true;
  } catch (error) {
    console.error("Failed to update event:", error.message);
    return false;
  }
}

/**
 * Registers a user to an event
 * @param {*} session 
 * @param {String} eventId 
 * @returns true if success and false if fail
 */
export async function registerToEvent(session, eventId) {
    const user = await getUser(session);
  if (!user) return false;

  try {
    await prisma.event.update({
      where: { id: eventId },
      data: {
        eventAttendees: {
          connect: { id: user.id },
        },
      },
    });
    return true;
  } catch (error) {
    console.error("Event registration failed:", error.message);
    return false;
  }
}

/**
 * Deregisters a user from an event
 * @param {*} session 
 * @param {String} eventId 
 * @returns true if success and false if fail
 */
export async function deregisterFromEvent(session, eventId) {
  const user = await getUser(session);
  if (!user) return false;

  try {
    await prisma.event.update({
      where: { id: eventId },
      data: {
        eventAttendees: {
          disconnect: { id: user.id },
        },
      },
    });
    return true;
  } catch (error) {
    console.error("Event deregistration failed:", error.message);
    return false;
  }
}

/**
 * Gets the data from user table
 * @param {*} session 
 * @returns the user data or null
 */
export async function getUser(session) {
  const { user } = session;
  if (!user) return null;

  return await prisma.user.findUnique({
    where: { authId: user.id },
  });
}

/**
 * Gets the organization from table
 * @param {*} session 
 * @returns organization data or null
 */
export async function getOrganization(session) {
    const { user } = session;
    if(!user) return null;

    return await prisma.organization.findUnique({
        where: { authId: user.id }
    });
}

/**
 * Gets all the events from the database
 * @returns list of all the events
 */
export async function getAllEvents() {
    return await prisma.event.findMany({
        include: {
            eventOwner: true,
            eventAttendees: true
        }
    });
}

/**
 * Refreshes the session since the session expires every hour
 * @param {*} session 
 * @returns refreshed session
 */
export async function refreshSession(session) {
    const { data: refreshedSession } = await supabase.auth.refreshSession(session.refresh_token);
    return refreshedSession.session;
}