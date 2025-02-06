"use client";
import { useEffect, useState, useRef } from "react";
import * as faceapi from "face-api.js";
import { db } from "@/app/firebase"; // Firebase konfiguratsiya faylini import qiling
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const employees = [
  { id: 1, name: "a", photoURL: "/employees/employee2.jpg" },
  { id: 2, name: "b", photoURL: "/employees/employee3.jpg" },
  { id: 3, name: "Nilufar quchqarova", photoURL: "/employees/employee4.jpg" },
  { id: 4, name: "Azizbek Anvarjanov", photoURL: "/employees/employee5.jpg" },
  {
    id: 5,
    name: "Gulbaxor Tursunboboyeva",
    photoURL: "/employees/employee6.jpg",
  },
];

export default function ScanPage() {
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [message, setMessage] = useState("");
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    const loadModels = async () => {
      try {
        await faceapi.nets.ssdMobilenetv1.loadFromUri("/models");
        await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
        await faceapi.nets.faceRecognitionNet.loadFromUri("/models");
        setModelsLoaded(true);
      } catch (error) {
        console.error("Model yuklashda xatolik:", error);
        setMessage("Model yuklashda xatolik yuz berdi.");
      }
    };
    loadModels();
  }, []);

  const startCamera = async () => {
    try {
      setScanning(true);
      setMessage("Kamera ishga tushmoqda...");

      const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setMessage("Yuzni skaner qilish...");
    } catch (error) {
      console.error("Kamerani ishga tushirishda xatolik:", error);
      setMessage("Kamerani ishga tushirishda muammo bor.");
      setScanning(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    setScanning(false);
  };

  const saveAttendance = async (employeeName) => {
    try {
      await addDoc(collection(db, "attendance"), {
        name: employeeName,
        timestamp: serverTimestamp(),
      });
      console.log(`Davomat saqlandi: ${employeeName}`);
    } catch (error) {
      console.error("Davomatni saqlashda xatolik:", error);
    }
  };

  const handleScan = async () => {
    if (!videoRef.current) {
      setMessage("Kamera yoqilmagan!");
      return;
    }

    setMessage("Yuz aniqlanmoqda...");

    await new Promise((resolve) => setTimeout(resolve, 2000));

    try {
      const face = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.SsdMobilenetv1Options())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!face) {
        setMessage("Yuz topilmadi!");
        stopCamera();
        return;
      }

      setMessage("Yuz aniqlandi, tekshirilmoqda...");

      for (let employee of employees) {
        const img = await faceapi.fetchImage(employee.photoURL);
        const labeledFace = await faceapi
          .detectSingleFace(img, new faceapi.SsdMobilenetv1Options())
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (!labeledFace) continue;

        const distance = faceapi.euclideanDistance(
          face.descriptor,
          labeledFace.descriptor
        );

        console.log(`Distance with ${employee.name}:`, distance);

        if (distance < 0.5) {
          setMessage(`Xodim topildi: ${employee.name}`);

          // **Davomatni Firebase'ga saqlash**
          await saveAttendance(employee.name);

          stopCamera();
          return;
        }
      }

      setMessage("Xodim topilmadi!");
      stopCamera();
    } catch (error) {
      console.error("Yuzni aniqlashda xatolik:", error);
      setMessage("Yuzni aniqlashda xatolik yuz berdi.");
      stopCamera();
    }
  };

  return (
    <div className="container">
      <h1>Yuzni Skannerlash</h1>
      {modelsLoaded ? (
        scanning ? (
          <div>
            <video ref={videoRef} autoPlay width="320" height="240"></video>
            <button onClick={handleScan}>Skaner qilish</button>
            <button onClick={stopCamera}>Kamerani to'xtatish</button>
          </div>
        ) : (
          <button onClick={startCamera}>Yuzni skaner qilish</button>
        )
      ) : (
        <p>Model yuklanmoqda...</p>
      )}
      <p>{message}</p>
    </div>
  );
}
