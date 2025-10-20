// THIS FILE CONTAINS ALL THE FUNCTIONS THAT YOU MAY NEED TO CALL TO GET STUFF FROM THE DATABASE
import supabase from "./supabase.js";
import prisma from "./prisma.js";
import Decimal from "decimal.js";

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
 * @returns user email or null id user already exists
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
    });
    return data.user.email;
}

/**
 * Creates an new organization
 * @param {String} email 
 * @param {String} password 
 * @param {String} orgName 
 * @param {Boolean} isApproved default=false. please don't change
 * @returns user email or null id organization already exists
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
    return data.user.email;
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
 * 
 * @param {string} email 
 * @returns true if successful and false if fails
 */
export async function resendConfirmationEmail(email) {
  try {
    const { data, error } = await supabase.auth.admin.generateLink({ //watch out for this: potentially unsafe
      type: 'signup', //this will send the email
      email
    });

    if (error) {
      console.error("Error resending confirmation:", error.message);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Unexpected error:", err);
    return false;
  }
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
 * Updates a user depending on given input fields
 * @param {String} userId 
 * @param {*} updatedFields 
 * @returns true if success and false if fail
 */
export async function updateUser(userId, updatedFields) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        ...updatedFields,
        updatedAt: new Date(),
      },
    });
    return true;
  } catch (error) {
    console.error("Failed to update user:", error.message);
    return false;
  }
}

/**
 * Updates an organization depending on given input fields
 * @param {String} orgId 
 * @param {*} updatedFields 
 * @returns true if success and false if fail
 */
export async function updateOrganization(orgId, updatedFields) {
  try {
    await prisma.organization.update({
      where: { id: orgId },
      data: {
        ...updatedFields,
        updatedAt: new Date(),
      },
    });
    return true;
  } catch (error) {
    console.error("Failed to update organization:", error.message);
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
  if(!session) return null;
  const { user } = session;
  if (!user) return null;
  const userData =  await prisma.user.findUnique({
    where: { authId: user.id },
  });
  return userData;
}

/**
 * Gets the organization from table
 * @param {*} session 
 * @returns organization data or null
 */
export async function getOrganization(session) {
  if(!session) return null;
  const { user } = session;
  if(!user) return null;
  const orgData = await prisma.organization.findUnique({
    where: { authId: user.id }
  });
  return orgData;
}

/**
 * Gets all the events from the database
 * @returns list of all the events
 */
export async function getAllEvents() {
    const events = await prisma.event.findMany({
        include: {
            eventOwner: true,
            eventAttendees: true
        }
    });

    return events;
}

/**
 * Gets all the organizations from the database
 * @returns list of all the organizations
 */
export async function getAllOrganizations() {
  const organizations = await prisma.organization.findMany();
  return organizations;
}

/**
 * Gets all the users from the database
 * @returns list of all the users
 */
export async function getAllUsers() {
  const users = await prisma.user.findMany();
  return users;
}


/**
 * get all events that a user is registered to
 * @param {*} session 
 * @returns array with all events that a user is registered to or []
 */
export async function getUserRegisteredEvents(session) {
  const user = await getUser(session);
  if (!user) return [];

  const userWithEvents = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      eventsRegistered: {
        include: {
          eventOwner: { select: { orgName: true } }, 
        },
      },
    },
  });

  return userWithEvents?.eventsRegistered ?? [];
}

/**
 * Gets all events owned by an organization
 * @param {*} session 
 * @returns array with all events owned by the organization or []
 */
export async function getAllEventsOwned(session) {
  const { user } = session;
  if (!user) return [];

  const org = await prisma.organization.findUnique({
    where: { authId: user.id },
    include: {
      eventsOwned: true, 
    },
  });

  return org?.eventsOwned ?? [];
}

/**
 * Gets all the users registered to an event through the eventId
 * @param {Number} eventId 
 * @returns array with all users registered to the event or []
 */
export async function getAllUsersRegisteredTo(eventId) {
    const events = await prisma.event.findUnique({
        where: {
            id: eventId,
        },
        include: {
            eventAttendees: true
        }
    });
    return events?.eventAttendees ?? [];
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

/**
 * Create tickets for an event after enforcing capacity
 * Supports "free" and "paid" (mock) ticket types
 * Creates or finds a user by email and creates `qty` Ticket records
 * @param {String} buyerName
 * @param {String} buyerEmail
 * @param {Number} eventId
 * @param {String} ticketType // 'free' | 'paid'
 * @param {Number} quantity
 * @param {Number|null} buyerId - DB user id of the authenticated buyer (required)
 * @returns {Object} { success: boolean, error?: string, tickets?: Array }
 */
export async function createTicketsForEvent(buyerName, buyerEmail, eventId, ticketType = 'free', quantity = 1, buyerId = null) {
  // Basic validation: require buyerId (authenticated user) and event
  if (!eventId || quantity < 1 || !buyerId) {
    return { success: false, error: 'Invalid input: buyerId (authenticated user) and eventId are required' };
  }

  // Find event
  const event = await prisma.event.findUnique({ where: { id: Number(eventId) }, include: { tickets: true } });
  if (!event) return { success: false, error: 'Event not found' };

  // Calculate existing tickets count (issued and checked_in)
  const existingTicketsCount = await prisma.ticket.count({ where: { eventId: event.id } });

  if (existingTicketsCount + quantity > event.maxAttendees) {
    return { success: false, error: 'Sold out or not enough capacity' };
  }

  // Mock payment flow for paid tickets
  if (ticketType === 'paid') {
    // In a real app we'd call a payment provider. Here we mock success.
    const paymentSuccess = true;
    if (!paymentSuccess) return { success: false, error: 'Payment failed' };
  }

  // Find user by id (authenticated). Do NOT auto-create guest users here.
  const user = await prisma.user.findUnique({ where: { id: Number(buyerId) } });
  if (!user) {
    return { success: false, error: 'Authenticated user not found; cannot create tickets' };
  }

  const createdTickets = [];
  for (let i = 0; i < quantity; i++) {
    const ticket = await prisma.ticket.create({ data: { eventId: event.id, userId: user.id } });
    createdTickets.push(ticket);
  }

  return { success: true, tickets: createdTickets };
}