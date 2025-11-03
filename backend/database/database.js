// THIS FILE CONTAINS ALL THE FUNCTIONS THAT YOU MAY NEED TO CALL TO GET STUFF FROM THE DATABASE
import supabase from "./supabase.js";
import prisma from "./prisma.js";
import Decimal from "decimal.js";
import crypto from "node:crypto";

/**
 * 
 * @returns a list of all the possible filter tags
 */
export function getAllTags() {
  return ["WORKSHOP", "SEMINAR", "LECTURE", "STUDY_SESSION", "HACKATHON", "BOOTCAMP", "RESEARCH_SYMPOSIUM", "COMPETITION", "EXAM_PREP", "TUTORING", "CAREER_FAIR", "INFO_SESSION", "NETWORKING", "RESUME_CLINIC", "INTERVIEW_PREP", "INTERNSHIP_FAIR", "COMPANY_VISIT", "PANEL_DISCUSSION", "ALUMNI_MEETUP", "ENTREPRENEURSHIP", "PARTY", "MIXER", "CLUB_FAIR", "GAME_NIGHT", "MOVIE_NIGHT", "CULTURAL_FESTIVAL", "CONCERT", "TALENT_SHOW", "STUDENT_GALA", "SPORTS_GAME", "FUNDRAISER", "CHARITY_EVENT", "CLEANUP_DRIVE", "BLOOD_DRIVE", "VOLUNTEERING", "AWARENESS_CAMPAIGN", "DONATION_DRIVE", "MENTORSHIP", "MEDITATION", "YOGA", "FITNESS_CLASS", "MENTAL_HEALTH", "SELF_DEVELOPMENT", "MINDFULNESS", "NUTRITION_TALK", "COUNSELING_SESSION", "CODING_CHALLENGE", "TECH_TALK", "AI_ML_WORKSHOP", "STARTUP_PITCH", "ROBOTICS_DEMO", "CYBERSECURITY", "PRODUCT_SHOWCASE", "CULTURAL_NIGHT", "LANGUAGE_EXCHANGE", "INTERNATIONAL_MEETUP", "PRIDE_EVENT", "HERITAGE_CELEBRATION", "INCLUSION_WORKSHOP", "ART_EXHIBIT", "PHOTOGRAPHY_CONTEST", "FILM_SCREENING", "THEATER_PLAY", "OPEN_MIC", "DANCE_PERFORMANCE", "MUSIC_JAM", "ECO_WORKSHOP", "RECYCLING_DRIVE", "CLIMATE_TALK", "GREEN_TECH", "TREE_PLANTING", "SUSTAINABILITY", "FREE_ENTRY", "PAID_EVENT", "ON_CAMPUS", "OFF_CAMPUS", "VIRTUAL", "HYBRID", "FOOD_PROVIDED", "CERTIFICATE_AVAILABLE", "TEAM_EVENT", "SOLO_EVENT"];
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
export async function createUser(email, password, firstName, lastName, role = 'USER') {
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

  if (error) {
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

export async function getEventById(id) {
  return await prisma.event.findUnique({
    where: { id },
    include: {
      eventOwner: true,
      eventAttendees: true,
    },
  });
}

// Count events grouped by locationName
export async function getRegionStats() {
  const rows = await prisma.event.groupBy({
    by: ["locationName"],
    _count: { id: true },
  });

  // normalize shape
  return rows
    .filter(r => r.locationName)
    .map(r => ({ region: r.locationName, count: r._count.id }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Creates an new organization
 * @param {String} email 
 * @param {String} password 
 * @param {String} orgName 
 * @param {Boolean} isApproved default=false. please don't change
 * @returns user email or null id organization already exists
 */
export async function createOrganization(email, password, orgName, isApproved = false) {
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

  if (error) {
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
  if (error) {
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
  const { error } = await supabase.auth.signOut();
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
export async function createEvent({
  title,
  description,
  cost = 0,
  maxAttendees,
  date,
  locationName = null,
  latitude = null,
  longitude = null,
  tags = [],
  eventOwnerId,            // may be null if admin creates w/out org
  imageUrl = null
}) {
  const event = await prisma.event.create({
    data: {
      title,
      description,
      cost: new Decimal(Number(cost) || 0),
      maxAttendees: Number(maxAttendees),
      date: new Date(date),
      locationName,
      latitude: latitude == null ? null : Number(latitude),
      longitude: longitude == null ? null : Number(longitude),
      imageUrl,
      tags: { set: tags },
      // If there is no org, eventOwnerId will be null — that's OK.
      eventOwnerId: eventOwnerId == null ? null : Number(eventOwnerId),
    },
    include: {
      eventOwner: true,
      eventAttendees: true,
      tickets: true,
    },
  });

  return event;
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
  if (error) {
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
  if (error) {
    console.error("Failed to delete user:", error.message);
    return false;
  }

  return true;
}
export async function deleteEvent(eventId) {
  try {
    const id = Number(eventId);

    await prisma.$transaction([
      // 1) sever M-N links to users
      prisma.event.update({
        where: { id },
        data: { eventAttendees: { set: [] } },
      }),
      // 2) remove tickets (child table)
      prisma.ticket.deleteMany({ where: { eventId: id } }),
      // 3) finally delete the event
      prisma.event.delete({ where: { id } }),
    ]);

    return true;
  } catch (error) {
    console.error("Failed to delete event:", error.message);
    return false;
  }
}

//update: coerce types safely and handle enum set
export async function updateEvent(eventId, updatedFields) {
  try {
    const data = { updatedAt: new Date() };

    // title / description
    if (updatedFields.title !== undefined) data.title = updatedFields.title;
    if (updatedFields.description !== undefined) data.description = updatedFields.description;

    // cost (Decimal)
    if (updatedFields.cost !== undefined) {
      const n = Number(updatedFields.cost);
      data.cost = new Decimal(isNaN(n) ? 0 : n);
    }

    // maxAttendees
    if (updatedFields.maxAttendees !== undefined) {
      const n = Number(updatedFields.maxAttendees);
      data.maxAttendees = isNaN(n) ? 0 : n;
    }

    // date: guard invalid/empty
    if (updatedFields.date !== undefined && updatedFields.date !== "") {
      const d = new Date(updatedFields.date);
      if (!isNaN(d.getTime())) data.date = d;
    }

    // location
    if (updatedFields.locationName !== undefined) data.locationName = updatedFields.locationName;

    // lat/lng: allow null, number, or empty -> null
    if (updatedFields.latitude !== undefined) {
      if (updatedFields.latitude === "" || updatedFields.latitude == null) data.latitude = null;
      else {
        const n = Number(updatedFields.latitude);
        data.latitude = isNaN(n) ? null : n;
      }
    }
    if (updatedFields.longitude !== undefined) {
      if (updatedFields.longitude === "" || updatedFields.longitude == null) data.longitude = null;
      else {
        const n = Number(updatedFields.longitude);
        data.longitude = isNaN(n) ? null : n;
      }
    }

    // tags: accept array or { set: array }
    if (Array.isArray(updatedFields.tags)) {
      data.tags = { set: updatedFields.tags };
    } else if (updatedFields.tags && Array.isArray(updatedFields.tags.set)) {
      data.tags = { set: updatedFields.tags.set };
    }

    // image
    if (updatedFields.imageUrl !== undefined) data.imageUrl = updatedFields.imageUrl;

    await prisma.event.update({
      where: { id: Number(eventId) },
      data
    });

    return true;
  } catch (error) {
    console.error("Failed to update event:", error.message, error);
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
 * @param {Number} userId  
 * @param {Number} eventId 
 * @returns true if success and false if fail
 */
export async function registerToEvent(userId, eventId) {
  try {
    await prisma.event.update({
      where: { id: Number(eventId) },
      data: {
        eventAttendees: {
          connect: { id: Number(userId) },
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
  if (!session) return null;
  const { user } = session;
  if (!user) return null;
  const userData = await prisma.user.findUnique({
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
  if (!session) return null;
  const { user } = session;
  if (!user) return null;
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
      eventAttendees: true,
      tickets: true,
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

// Get events owned by a specific organization
export async function getAllEventsOwnedByOrgId(orgId) {
  try {
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      include: { eventsOwned: true },
    });
    return org?.eventsOwned || [];
  } catch (error) {
    console.error("Failed to fetch events for organization:", error.message);
    return [];
  }
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
 * @param {Number} userId
 * @param {Number} eventId
 * @returns {Object} { success: boolean, error?: string, ticket?: Object }
 */
export async function createTicketForEvent(eventId, userId) {
  // Basic validation: require user and event
  if (!eventId || !userId) {
    return { success: false, error: 'Invalid input: user and event are required' };
  }
  const token = crypto.randomBytes(24).toString("base64url");
  try {
    const createdTicket = await prisma.ticket.create({
      data: {
        eventId: Number(eventId),
        userId: Number(userId),
        qrToken: token,
      }
    });

    return { success: true, ticket: createdTicket };
  } catch (err) {
    console.error('Prisma error creating ticket:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Get administrator analytics data
 * Returns number of events, tickets, attendance, and participation trends
 * @returns {Object} Analytics data with numEvents, numTickets, totalAttendance, and attendanceTrend
 */
export async function getAdminAnalytics() {
  try {
    // Get total number of events
    const numEvents = await prisma.event.count();

    // Get total number of tickets
    const numTickets = await prisma.ticket.count();

    // Get total attendance (checked-in tickets)
    const totalAttendance = await prisma.ticket.count({
      where: {
        status: 'CHECKED_IN'
      }
    });

    // Get participation trend data - group by event date
    // Get all events with their ticket stats
    const events = await prisma.event.findMany({
      include: {
        tickets: true
      },
      orderBy: {
        date: 'asc'
      }
    });

    // Group events by week for trend analysis
    const trendMap = new Map();

    events.forEach(event => {
      // Format date as YYYY-MM-DD for grouping by week
      const eventDate = new Date(event.date);
      const weekStart = getWeekStart(eventDate);
      const weekKey = weekStart.toISOString().split('T')[0];

      const registered = event.tickets.length;
      const attended = event.tickets.filter(t => t.status === 'CHECKED_IN').length;

      if (!trendMap.has(weekKey)) {
        trendMap.set(weekKey, { registered: 0, attended: 0 });
      }

      const current = trendMap.get(weekKey);
      current.registered += registered;
      current.attended += attended;
    });

    // Convert map to array for response
    const attendanceTrend = Array.from(trendMap.entries()).map(([label, data]) => ({
      label,
      registered: data.registered,
      attended: data.attended
    }));

    return {
      numEvents,
      numTickets,
      totalAttendance,
      attendanceTrend
    };
  } catch (err) {
    console.error('Error fetching admin analytics:', err);
    throw err;
  }
}

/**
 * Helper function to get the start of the week (Monday) for a given date
 * @param {Date} date 
 * @returns {Date} Start of the week
 */
function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(d.setDate(diff));
}

/**
 * Get analytics data for a specific event
 * Returns tickets issued, attended, attendance rate, capacity, and remaining capacity
 * @param {Number} eventId - The event ID
 * @returns {Object} Analytics data for the event
 */
export async function getEventAnalytics(eventId) {
  try {
    // Validate event ID
    if (!eventId) {
      throw new Error('Event ID is required');
    }

    // Get event with tickets
    const event = await prisma.event.findUnique({
      where: {
        id: Number(eventId)
      },
      include: {
        tickets: true,
        eventOwner: true
      }
    });

    // Handle missing event
    if (!event) {
      throw new Error('Event not found');
    }

    // Calculate metrics
    const capacity = event.maxAttendees;
    const ticketsIssued = event.tickets.length;
    const attended = event.tickets.filter(ticket => ticket.status === 'CHECKED_IN').length;
    const remainingCapacity = Math.max(0, capacity - ticketsIssued);

    // Calculate attendance rate (handle zero tickets case)
    const attendanceRate = ticketsIssued > 0
      ? ((attended / ticketsIssued) * 100).toFixed(1)
      : 0;

    // Calculate capacity utilization
    const capacityUtilization = capacity > 0
      ? ((ticketsIssued / capacity) * 100).toFixed(1)
      : 0;

    return {
      eventId: event.id,
      eventTitle: event.title,
      eventDate: event.date,
      organizationName: event.eventOwner.orgName,
      capacity,
      ticketsIssued,
      attended,
      remainingCapacity,
      attendanceRate: parseFloat(attendanceRate),
      capacityUtilization: parseFloat(capacityUtilization),
      // Additional breakdown for visualization
      notAttended: ticketsIssued - attended,
      isEventPast: new Date(event.date) < new Date(),
    };
  } catch (err) {
    console.error('Error fetching event analytics:', err);
    throw err;
  }
}