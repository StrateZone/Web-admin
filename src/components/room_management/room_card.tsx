interface Room {
  roomId: number;
  roomName: string;
  type: string;
  description: string;
  capacity: number;
  status: string;
  price: number;
  unit: string;
}

interface RoomCardProps {
  room: Room;
  onSelect: () => void;
}
const statusMap: Record<string, string> = {
  available: "Đang mở",
  unavailable: "Không khả dụng",
  closed: "Đã đóng",
};

export default function RoomCard({ room, onSelect }: RoomCardProps) {
  return (
    <div
      className="border rounded-2xl shadow-md p-4 cursor-pointer hover:bg-gray-200 transition"
      onClick={onSelect}
    >
      <h2 className="text-xl font-bold">{room.roomName}</h2>
      <p className="text-sm text-gray-500">
        {room.type} - {statusMap[room.status] || "Không xác định"}
      </p>
    </div>
  );
}
