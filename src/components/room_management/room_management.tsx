import React from "react";
import RoomList from "./room_list";
import TableList from "./table_list";

// interface Table {
//   tableId: number;
//   roomId: number;
//   gameTypeId: number;
//   status: string;
// }

// interface Room {
//   roomId: number;
//   roomName: string;
//   type: string;
//   description: string;
//   capacity: number;
//   status: string;
//   price: number;
//   unit: string;
//   tables: Table[];
// }

export default function RoomManagement() {
  return (
    <div className="p-4 min-h-full p-6 bg-gray-400">
      <RoomList></RoomList>
      <TableList></TableList>
    </div>
  );
}
