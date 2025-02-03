"use client";
import { useState } from "react";
import { db, storage } from "../lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function Admin() {
  const [name, setName] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!name || !image)
      return alert("Iltimos, barcha maydonlarni to'ldiring!");

    setLoading(true);

    try {
      // Fayl nomini xodim ismi bo‘yicha belgilash
      const fileName = `employees/${name.replace(/\s/g, "_")}.jpg`;
      const storageRef = ref(storage, fileName);

      // Rasmlarni Firebase Storage'ga yuklash
      await uploadBytes(storageRef, image);
      const photoURL = await getDownloadURL(storageRef);

      // Xodimni Firestore bazasiga qo‘shish
      await addDoc(collection(db, "employees"), {
        name,
        photoURL,
      });

      alert("Xodim muvaffaqiyatli qo'shildi!");
      setName("");
      setImage(null);
    } catch (error) {
      console.error("Xatolik yuz berdi:", error);
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6">
      <h1 className="text-xl font-bold">Xodim qo'shish</h1>
      <input
        type="text"
        placeholder="Xodim ismi"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border p-2 rounded"
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImage(e.target.files[0])}
      />
      <button
        onClick={handleUpload}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        {loading ? "Yuklanmoqda..." : "Qo'shish"}
      </button>
    </div>
  );
}
