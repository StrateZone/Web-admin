import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Typography,
} from "@material-tailwind/react";

import { motion, AnimatePresence } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import RoomDetail from "./room_details";
import RoomCard from "./room_card";
import { DefaultPagination } from "../pagination/pagination";
import axios from "axios";
import { config } from "../../../config";
import AddRoomPopup from "./add_room_form";

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

export default function RoomList() {
  const backendApi = config.BACKEND_API;
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [showAddRoomPopup, setShowAddRoomPopup] = useState(false);

  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const abortControllerRef = useRef<AbortController | null>(null);
  let latestRequestId = 0;

  const fetchRooms = async () => {
    // Tăng requestId mới
    const requestId = ++latestRequestId;

    // Hủy request cũ nếu có
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Tạo controller mới cho request này
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    try {
      const res = await axios.get(`${backendApi}/rooms/all`, {
        signal: controller.signal,
        params: {
          "page-number": currentPage,
          "page-size": 10,
        },
      });
      // Chỉ xử lý nếu là request mới nhất
      if (requestId === latestRequestId) {
        setRooms(res.data.pagedList);
        setTotalPages(res.data.totalPages);
      }
    } catch (error: any) {
      if (axios.isCancel(error)) {
        console.log("Request cancelled");
      } else if (requestId === latestRequestId) {
        console.log("Lỗi khi tải danh sách lịch hẹn.");
      }
    } finally {
      if (requestId === latestRequestId) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [currentPage]);

  const handleBack = () => {
    setSelectedRoomId(null);
  };

  console.log(loading);

  return (
    <div className="p-4 min-h-full p-6 bg-gray-400">
      <Card className="w-full max-w-6xl mx-auto px-6 py-4">
        <CardHeader
          variant="gradient"
          color="gray"
          className="mb-8 p-6 flex justify-between items-center"
        >
          <Typography variant="h6" color="white">
            Danh sách phòng
          </Typography>
        </CardHeader>

        {!selectedRoomId && (
          <Button
            color="blue"
            className="text-white "
            onClick={() => setShowAddRoomPopup(true)}
          >
            Thêm phòng
          </Button>
        )}

        <CardBody>
          {loading ? (
            <div className="flex justify-center items-center min-h-[200px]">
              <div className="flex justify-center items-center h-48">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-800" />
              </div>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {selectedRoomId ? (
                <motion.div
                  key="detail"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                >
                  <RoomDetail roomId={selectedRoomId} onBack={handleBack} />
                </motion.div>
              ) : (
                <motion.div
                  key="list"
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  {rooms.map((room) => (
                    <RoomCard
                      key={room.roomId}
                      room={room}
                      onSelect={() => setSelectedRoomId(room.roomId)}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </CardBody>

        {!selectedRoomId && (
          <div className="flex justify-center mt-4">
            <DefaultPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </Card>
      {showAddRoomPopup && (
        <AddRoomPopup
          onClose={() => setShowAddRoomPopup(false)}
          onSuccess={() => fetchRooms()}
        />
      )}
    </div>
  );
}
