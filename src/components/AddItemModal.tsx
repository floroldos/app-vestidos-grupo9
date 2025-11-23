"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface AddItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onSubmit: (data: any) => Promise<void>;
}

export default function AddItemModal({ isOpen, onClose, onSubmit }: AddItemModalProps) {
    const [category, setCategory] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [sizes, setSizes] = useState<{ size: string; stock: boolean }[]>([
        { size: "XS", stock: true },
        { size: "S", stock: true },
        { size: "M", stock: true },
        { size: "L", stock: false },
        { size: "XL", stock: false },
    ]);

    const [images, setImages] = useState<File[]>([]);
    const [error, setError] = useState("");

    if (!isOpen) return null;

    // Convert File → base64
    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const filesArray = Array.from(e.target.files);
        setImages((prev) => [...prev, ...filesArray]);
    };

    const removeFile = (index: number) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
    };

    // Validaciones
    const validate = () => {
        if (!category) return "La categoría es obligatoria.";
        if (description.length < 50) return "La descripción debe tener al menos 50 caracteres.";
        if (description.length > 500) return "La descripción no puede superar 500 caracteres.";
        if (!price || Number(price) <= 0) return "El precio debe ser mayor a 0.";
        if (images.length < 3) return "Debes subir al menos 3 imágenes.";
        return "";
    };

    const handleSubmit = async () => {
        const validation = validate();
        if (validation) {
            setError(validation);
            return;
        }

        // Convertir imágenes → base64 para JSON
        const base64Images = await Promise.all(images.map((file) => fileToBase64(file)));

        await onSubmit({
            category,
            description,
            price,
            sizes,
            images: base64Images,
        });

        // Reset form
        setCategory("");
        setDescription("");
        setPrice("");
        setImages([]);
        setError("");

        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-[9999] p-4">
            <div className="bg-[#0f172a] border border-[#334155] w-full max-w-lg rounded-xl p-6 shadow-xl text-[#f1f5f9]">

                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Agregar nuevo artículo</h2>
                    <button onClick={onClose}>
                        <X className="w-6 h-6 text-gray-300 hover:text-white" />
                    </button>
                </div>

                {/* ERROR */}
                {error && (
                    <p className="mb-3 text-red-400 bg-red-950/30 border border-red-800 px-3 py-2 rounded-lg">
                        {error}
                    </p>
                )}

                <div className="flex flex-col gap-4">

                    {/* CATEGORY */}
                    <div>
                        <label className="block mb-1">Categoría</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full bg-[#1e293b] border border-[#334155] text-[#f1f5f9] rounded-lg p-2 outline-none"
                        >
                            <option value="">Seleccionar...</option>
                            <option value="Vestido">Vestido</option>
                            <option value="Enterito">Enterito</option>
                            <option value="Dos piezas">Dos piezas</option>
                        </select>
                    </div>

                    {/* DESCRIPTION */}
                    <div>
                        <label className="block mb-1">Descripción</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            className="w-full bg-[#1e293b] border border-[#334155] text-[#f1f5f9] rounded-lg p-2 resize-none outline-none"
                        />
                        <p className="text-xs text-gray-400">{description.length}/500</p>
                    </div>

                    {/* PRICE */}
                    <div>
                        <label className="block mb-1">Precio (UYU)</label>
                        <input
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className="w-full bg-[#1e293b] border border-[#334155] text-[#f1f5f9] rounded-lg p-2 outline-none"
                        />
                    </div>

                    {/* FILE UPLOAD */}
                    <div>
                        <label className="block mb-1">Imágenes (mínimo 3)</label>

                        <label className="cursor-pointer bg-purple-600 hover:bg-purple-700 transition text-white px-4 py-2 rounded-lg inline-block">
                            Seleccionar imágenes
                            <input
                                type="file"
                                multiple
                                className="hidden"
                                accept="image/*"
                                onChange={handleFiles}
                            />
                        </label>

                        <ul className="mt-3 space-y-2">
                            {images.map((file, i) => (
                                <li
                                    key={i}
                                    className="flex justify-between items-center bg-[#1e293b] px-3 py-2 rounded-lg border border-[#334155]"
                                >
                                    <span className="text-sm">{file.name}</span>
                                    <button onClick={() => removeFile(i)}>
                                        <X className="w-4 h-4 text-red-400 hover:text-red-200" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                </div>

                {/* FOOTER */}
                <div className="flex justify-end gap-3 mt-5">
                    <button
                        className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600"
                        onClick={onClose}
                    >
                        Cancelar
                    </button>
                    <button
                        className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700"
                        onClick={handleSubmit}
                    >
                        Agregar
                    </button>
                </div>

            </div>
        </div>
    );
}
