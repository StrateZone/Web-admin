import React from "react";
import RoomList from "./room_list";
import TableList from "./table_list";
import GameTypeList from "./game_type_list";
import RoomTypeList from "./room _type_list";

export default function RoomManagement() {
  return (
    <div className="p-4 min-h-full p-6 bg-gray-400">
      <RoomList></RoomList>
      <RoomTypeList />
      <GameTypeList></GameTypeList>
      <TableList></TableList>
    </div>
  );
}
