import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import EventAnalytics from "../components/Discover/EventAnalytics";

// Mock Chart.js
jest.mock("react-chartjs-2", () => ({
  Doughnut: () => <div data-testid="doughnut-chart">Chart</div>,
}));

jest.mock("../hooks/usePageTitle", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({ eventId: "1" }),
}));

const mockEventAnalytics = {
  eventTitle: "Tech Workshop",
  eventDate: "2025-11-20T14:00:00Z",
  organizationName: "Test Org",
  capacity: 100,
  ticketsIssued: 75,
  attended: 60,
  notAttended: 15,
  remainingCapacity: 25,
  capacityUtilization: 75,
  attendanceRate: 80,
  isEventPast: false,
};

describe("EventAnalytics Component", () => {
  const mockToken = "test-token";
  const mockOrg = { id: 1, email: "org@test.com", orgName: "Test Org" };

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should display loading state", () => {
    global.fetch.mockImplementation(() => new Promise(() => {}));

    render(
      <BrowserRouter>
        <EventAnalytics token={mockToken} org={mockOrg} />
      </BrowserRouter>
    );

    expect(screen.getByText(/loading event analytics/i)).toBeInTheDocument();
  });

  it("should render event analytics with data", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockEventAnalytics,
    });

    render(
      <BrowserRouter>
        <EventAnalytics token={mockToken} org={mockOrg} />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Tech Workshop")).toBeInTheDocument();
      expect(screen.getByText("75")).toBeInTheDocument();
      expect(screen.getByText("60")).toBeInTheDocument();
    });
  });

  it("should display correct percentages", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockEventAnalytics,
    });

    render(
      <BrowserRouter>
        <EventAnalytics token={mockToken} org={mockOrg} />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/75%/i)).toBeInTheDocument(); // capacity utilization
      expect(screen.getByText(/80% of ticket holders attended/i)).toBeInTheDocument();
    });
  });

  it("should show empty state when no tickets", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ...mockEventAnalytics,
        ticketsIssued: 0,
        attended: 0,
      }),
    });

    render(
      <BrowserRouter>
        <EventAnalytics token={mockToken} org={mockOrg} />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/no tickets issued yet/i)).toBeInTheDocument();
    });
  });

  it("should render chart component", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockEventAnalytics,
    });

    render(
      <BrowserRouter>
        <EventAnalytics token={mockToken} org={mockOrg} />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId("doughnut-chart")).toBeInTheDocument();
    });
  });

  it("should handle API error", async () => {
    global.fetch.mockRejectedValueOnce(new Error("Network error"));

    render(
      <BrowserRouter>
        <EventAnalytics token={mockToken} org={mockOrg} />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/unable to load analytics/i)).toBeInTheDocument();
    });
  });

  describe("Organizer Dashboard - UI and Data Match", () => {
    it("should display backend data accurately in UI", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockEventAnalytics,
      });

      render(
        <BrowserRouter>
          <EventAnalytics token={mockToken} org={mockOrg} />
        </BrowserRouter>
      );

      await waitFor(() => {
        // Verify all metrics from backend are displayed
        expect(screen.getByText("75")).toBeInTheDocument(); // ticketsIssued
        expect(screen.getByText("60")).toBeInTheDocument(); // attended
        expect(screen.getByText("25")).toBeInTheDocument(); // remainingCapacity
      });
    });

    it("should calculate and display attendance rate correctly", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockEventAnalytics,
      });

      render(
        <BrowserRouter>
          <EventAnalytics token={mockToken} org={mockOrg} />
        </BrowserRouter>
      );

      await waitFor(() => {
        // 60 attended / 75 issued * 100 = 80%
        expect(screen.getByText(/80% of ticket holders attended/i)).toBeInTheDocument();
      });
    });

    it("should display capacity utilization correctly", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockEventAnalytics,
      });

      render(
        <BrowserRouter>
          <EventAnalytics token={mockToken} org={mockOrg} />
        </BrowserRouter>
      );

      await waitFor(() => {
        // 75 tickets / 100 capacity * 100 = 75%
        expect(screen.getByText(/of 100 capacity \(75%\)/i)).toBeInTheDocument();
      });
    });

    it("should load without console errors", async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockEventAnalytics,
      });

      render(
        <BrowserRouter>
          <EventAnalytics token={mockToken} org={mockOrg} />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText("Tech Workshop")).toBeInTheDocument();
      });

      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
