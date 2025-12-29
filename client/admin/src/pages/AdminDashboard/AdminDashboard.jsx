import { useState } from "react";

import VBox from "@components/VBox";
import HBox from "@components/HBox";
import AdminSidebar from "@components/Sidebar/AdminSidebar";
import StatsCell from "@components/Hero/StatsCell";
import Panel from "@components/Panel";
import FilterButton from "@components/IconButton/FilterButton";
import TablePanel from "@components/TablePanel";

const activityTabs = [
  "System Activity",
  "User Activity",
  "Marketplace Activity",
];
const headers = ["Timestamp", "Event Type", "User", "Details"];
const activity = [
  {
    timestamp: "2024-10-01 12:00",
    event_type: "Login",
    user: "Alice",
    details: "User Alice logged in.",
  },
  {
    timestamp: "2024-10-01 12:05",
    event_type: "Auction Created",
    user: "Bob",
    details: "User Bob created an auction for 'Vintage Clock'.",
  },
  {
    timestamp: "2024-10-01 12:10",
    event_type: "Bid Placed",
    user: "Charlie",
    details: "User Charlie placed a bid of $150 on 'Vintage Clock'.",
  },
];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState(activityTabs[0]);

  return (
    <VBox className="p-10 gap-40">
      <HBox className="gap-10">
        <AdminSidebar />
        {/* <span className="text-6xl font-bold text-black self-center flex-grow">
          DASHBOARD
        </span> */}
        <HBox className="w-full">
          <StatsCell
            number={100000}
            label="Total Users"
            className="flex-1 h-full"
          />
          <StatsCell
            number={100000}
            label="Active Users"
            className="flex-1 h-full"
          />
          <StatsCell
            number={100000}
            label="Total Auctions"
            className="flex-1 h-full"
          />
          <StatsCell
            number={100000}
            label="Active Auctions"
            className="flex-1 h-full"
          />
        </HBox>
      </HBox>

      <VBox>
        <span className="text-4xl font-semibold text-black">
          Recent Activity
        </span>
        <span className="h-1" />
        <Panel className="rounded-lg !p-0">
          <HBox className="w-full !gap-0">
            {activityTabs.map((text, i) => {
              const active = activeTab === text;

              return (
                <button
                  key={text}
                  className={`
                    flex-1 flex justify-center items-center
                    py-4
                    font-semibold
                    ${
                      active
                        ? "opacity-100 bg-primary bg-opacity-60"
                        : "opacity-50"
                    }
                    hover:opacity-100 hover:bg-primary hover:bg-opacity-60
                    transition-colors transition-opacity
                  `}
                  onClick={(i) => {
                    setActiveTab(text);
                  }}
                >
                  {text}
                </button>
              );
            })}
          </HBox>
        </Panel>

        <FilterButton onClick={() => {}} className="w-auto self-start" />

        <TablePanel headers={headers} rows={activity} />
      </VBox>
    </VBox>
  );
};

export default AdminDashboard;
