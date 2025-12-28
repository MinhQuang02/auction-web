import { useState, useEffect } from "react";

import VBox from "@/components/VBox";
import HBox from "@/components/HBox";
import AdminSidebar from "@/components/Sidebar/AdminSidebar";
import ActionBar from "@/components/ActionBar";
import TablePanel from "@/components/TablePanel";
import AuctionDetail from "./AuctionDetail";
import Modal from "@/components/Modal";

const headers = [
  "ID",
  "Product",
  "Seller",
  "Category",
  "Status",
  "Time Left",
  "Current Highest Bid",
];

const auctions = [
  {
    id: 1,
    product: "Apple iPhone 15 Pro Max",
    seller_id: "TechGuru92",
    seller: "Tech Guru",
    category_id: "electronics",
    category: "Electronics",
    status: "Active",
    start_date: "2025-11-30 10:00",
    end_date: "2025-12-05 18:00",
    images: ["https://example.com/img1.jpg", "https://example.com/img2.jpg"],
    description: "Brand new iPhone 15 Pro Max...",
    current_highest_bid: 1250,
    buy_now_price: 1500,
    number_of_bids: 5,
    bid_history: [
      { bidder_name: "Alice", amount: 1000, time: "2025-11-30 11:00" },
      { bidder_name: "Bob", amount: 1100, time: "2025-11-30 11:30" },
    ],
  },
  {
    id: 2,
    product: "Vintage Rolex Submariner",
    seller: "LuxuryTimepieces",
    category: "Watches",
    status: "Active",
    time_left: "1d 5h",
    current_highest_bid: 12000,
  },
  {
    id: 3,
    product: "Signed First Edition Book",
    seller: "BookCollector88",
    category: "Books",
    status: "Ended",
    time_left: "0s",
    current_highest_bid: 350,
  },
  {
    id: 4,
    product: "Mountain Bike Trek Marlin 8",
    seller: "OutdoorAdventures",
    category: "Sports",
    status: "Active",
    time_left: "5h 40m",
    current_highest_bid: 620,
  },
  {
    id: 5,
    product: "Sony A7 IV Camera",
    seller: "PhotoPro",
    category: "Electronics",
    status: "Active",
    time_left: "12h 10m",
    current_highest_bid: 2200,
  },
  {
    id: 6,
    product: "Handmade Persian Rug",
    seller: "DecorMaster",
    category: "Home & Living",
    status: "Active",
    time_left: "2d 3h",
    current_highest_bid: 1450,
  },
  {
    id: 7,
    product: "Nintendo Switch OLED",
    seller: "GamerWorld",
    category: "Gaming",
    status: "Active",
    time_left: "8h 25m",
    current_highest_bid: 380,
  },
  {
    id: 8,
    product: "Limited Edition Sneakers",
    seller: "SneakerHeads",
    category: "Fashion",
    status: "Ended",
    time_left: "0s",
    current_highest_bid: 540,
  },
];

const AuctionManagement = () => {
  const [selectedAuction, setSelectedAuction] = useState(null);

  return (
    <VBox className="p-10 gap-40">
      <HBox className="gap-10">
        <AdminSidebar />
        <span className="text-6xl font-bold text-black self-center flex-grow">
          AUCTIONS
        </span>
      </HBox>

      <VBox>
        <ActionBar
          onFilter={() => {}}
          onSearch={() => {}}
          onAdd={() => {}}
          onRemove={() => {}}
          onEdit={() => {}}
        />

        <TablePanel
          headers={headers}
          rows={auctions}
          onRowClick={(row) => setSelectedAuction(row)}
        />

        <Modal
          isOpen={!!selectedAuction}
          onClose={() => setSelectedAuction(null)}
        >
          {selectedAuction && <AuctionDetail auction={selectedAuction} />}
        </Modal>
      </VBox>
    </VBox>
  );
};

export default AuctionManagement;
