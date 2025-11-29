"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface EditItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    item: any; // Item a editar
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onSubmit: (data: any) => Promise<void>;
}

export default function EditItemModal({ isOpen, onClose, item, onSubmit }: EditItemModalProps) {
    const [name, setName] = useState("");
    const [category, setCategory] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [color, setColor] = useState("");
    const [style, setStyle] = useState("");
    const [sizes, setSizes] = useState("");
    const [images, setImages] = useState<File[]>([]);
    const [existingImages, setExistingImages] = useState<string[]>([]);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // Cargar datos del item cuando cambia
    useEffect(() => {
        if (item) {
            setName(item.name || "");
            setCategory(item.category || "");
            setDescription(item.description || "");
            setPrice(item.pricePerDay?.toString() || "");
            setColor(item.color || "");
            setStyle(item.style || "");
            setSizes(Array.isArray(item.sizes) ? item.sizes.join(", ") : "");
            setExistingImages(item.images || []);
            setImages([]);
            setError("");
            setSuccessMessage("");
        }
    }, [item]);

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

    const removeNewFile = (index: number) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
    };

    const removeExistingImage = (index: number) => {
        setExistingImages((prev) => prev.filter((_, i) => i !== index));
    };

    // Validaciones
    const validate = () => {
        if (!name.trim()) return "Name is required.";
        if (!category) return "Category is required.";
        if (description.length < 50) return "Description must be at least 50 characters.";
        if (description.length > 500) return "Description cannot exceed 500 characters.";
        if (!price || Number(price) <= 0) return "Price must be greater than 0.";
        
        const totalImages = existingImages.length + images.length;
        if (totalImages < 3) return "You must have at least 3 images in total.";
        
        return "";
    };

    const handleSubmit = async () => {
        const validation = validate();
        if (validation) {
            setError(validation);
            return;
        }

        try {
            // Convertir nuevas imágenes a base64
            const newBase64Images = await Promise.all(images.map((file) => fileToBase64(file)));
            
            // Combinar imágenes existentes con las nuevas
            const allImages = [...existingImages, ...newBase64Images];

            // Convertir sizes string a array
            const sizesArray = sizes.split(",").map(s => s.trim()).filter(s => s);

            await onSubmit({
                id: item.id,
                name: name.trim(),
                category,
                description,
                pricePerDay: Number(price),
                color: color.trim() || undefined,
                style: style.trim() || undefined,
                sizes: sizesArray,
                images: allImages,
                alt: name.trim(), // Usar el nombre como alt
            });

            // Mostrar confirmación de éxito
            setSuccessMessage('Item updated successfully!');
            setError("");
            
            // Cerrar modal después de 1.5 segundos
            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (err) {
            setError('Failed to update item. Please try again.');
            setSuccessMessage("");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-start justify-center z-[9999] p-4 overflow-y-auto">
            <div className="bg-[#0f172a] border border-[#334155] w-full max-w-4xl rounded-xl shadow-xl text-[#f1f5f9] my-8 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex justify-between items-center p-6 pb-4 border-b border-[#334155]">
                    <h2 className="text-xl font-semibold">Edit item #{item?.id}</h2>
                    <button onClick={onClose}>
                        <X className="w-6 h-6 text-gray-300 hover:text-white" />
                    </button>
                </div>

                {/* Content with scroll */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* ERROR */}
                    {error && (
                        <p className="mb-3 text-red-400 bg-red-950/30 border border-red-800 px-3 py-2 rounded-lg">
                            {error}
                        </p>
                    )}

                {/* Layout en dos columnas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* LEFT COLUMN - Basic info */}
                    <div className="flex flex-col gap-4">

                        {/* NAME */}
                        <div>
                            <label className="block mb-1 text-sm font-medium">Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-[#1e293b] border border-[#334155] text-[#f1f5f9] rounded-lg p-2 outline-none"
                            />
                        </div>

                        {/* CATEGORY */}
                        <div>
                            <label className="block mb-1 text-sm font-medium">Category</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full bg-[#1e293b] border border-[#334155] text-[#f1f5f9] rounded-lg p-2 outline-none"
                            >
                                <option value="">Select...</option>
                                <option value="dress">Dress</option>
                                <option value="shoes">Shoes</option>
                                <option value="bag">Bag</option>
                                <option value="jacket">Jacket</option>
                            </select>
                        </div>

                        {/* PRICE y COLOR en fila */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block mb-1 text-sm font-medium">Price/day</label>
                                <input
                                    type="number"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    className="w-full bg-[#1e293b] border border-[#334155] text-[#f1f5f9] rounded-lg p-2 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block mb-1 text-sm font-medium">Color</label>
                                <input
                                    type="text"
                                    value={color}
                                    onChange={(e) => setColor(e.target.value)}
                                    className="w-full bg-[#1e293b] border border-[#334155] text-[#f1f5f9] rounded-lg p-2 outline-none"
                                />
                            </div>
                        </div>

                        {/* STYLE */}
                        <div>
                            <label className="block mb-1 text-sm font-medium">Style</label>
                            <input
                                type="text"
                                value={style}
                                onChange={(e) => setStyle(e.target.value)}
                                className="w-full bg-[#1e293b] border border-[#334155] text-[#f1f5f9] rounded-lg p-2 outline-none"
                                placeholder="e.g: Elegant, Casual, Formal"
                            />
                        </div>

                        {/* SIZES */}
                        <div>
                            <label className="block mb-1 text-sm font-medium">Sizes (separate with commas)</label>
                            <input
                                type="text"
                                value={sizes}
                                onChange={(e) => setSizes(e.target.value)}
                                className="w-full bg-[#1e293b] border border-[#334155] text-[#f1f5f9] rounded-lg p-2 outline-none"
                                placeholder="Example: S, M, L, XL"
                            />
                        </div>

                        {/* DESCRIPTION */}
                        <div>
                            <label className="block mb-1 text-sm font-medium">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={4}
                                className="w-full bg-[#1e293b] border border-[#334155] text-[#f1f5f9] rounded-lg p-2 resize-none outline-none"
                            />
                            <p className="text-xs text-gray-400 mt-1">{description.length}/500</p>
                        </div>

                    </div>

                    {/* RIGHT COLUMN - Images */}
                    <div className="flex flex-col gap-4">

                        <div>
                            <h3 className="text-sm font-medium mb-3">Image management</h3>
                            <p className="text-xs text-gray-400 mb-3">
                                Total: {existingImages.length + images.length} / minimum 3
                            </p>
                        </div>

                        {/* EXISTING IMAGES */}
                        {existingImages.length > 0 && (
                            <div>
                                <label className="block mb-2 text-sm font-medium">Current images</label>
                                <div className="max-h-48 overflow-y-auto space-y-2">
                                    {existingImages.map((img, i) => (
                                        <div
                                            key={i}
                                            className="flex justify-between items-center bg-[#1e293b] px-3 py-2 rounded-lg border border-[#334155]"
                                        >
                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                {img.startsWith('data:image') ? (
                                                    <img src={img} alt="" className="w-10 h-10 object-cover rounded" />
                                                ) : (
                                                    <div className="w-10 h-10 bg-gray-700 rounded flex items-center justify-center text-xs">IMG</div>
                                                )}
                                                <span className="text-sm truncate">Image {i + 1}</span>
                                            </div>
                                            <button onClick={() => removeExistingImage(i)} type="button">
                                                <X className="w-4 h-4 text-red-400 hover:text-red-200" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* NEW IMAGES UPLOAD */}
                        <div>
                            <label className="block mb-2 text-sm font-medium">
                                Add new images {existingImages.length + images.length < 3 && `(missing ${3 - existingImages.length - images.length})`}
                            </label>

                            <label className="cursor-pointer bg-purple-600 hover:bg-purple-700 transition text-white px-4 py-2 rounded-lg inline-block text-sm">
                                📁 Select images
                                <input
                                    type="file"
                                    multiple
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFiles}
                                />
                            </label>

                            {images.length > 0 && (
                                <div className="mt-3 max-h-48 overflow-y-auto space-y-2">
                                    {images.map((file, i) => (
                                        <div
                                            key={i}
                                            className="flex justify-between items-center bg-[#1e293b] px-3 py-2 rounded-lg border border-[#334155]"
                                        >
                                            <span className="text-sm truncate">{file.name}</span>
                                            <button onClick={() => removeNewFile(i)} type="button">
                                                <X className="w-4 h-4 text-red-400 hover:text-red-200" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                    </div>

                </div>
                </div>

                {/* SUCCESS MESSAGE - Fixed at bottom of content */}
                {successMessage && (
                    <div className="px-6 py-3">
                        <p className="text-green-400 bg-green-950/30 border border-green-800 px-3 py-2 rounded-lg">
                            ✓ {successMessage}
                        </p>
                    </div>
                )}

                {/* FOOTER - Sticky at bottom */}
                <div className="flex justify-end gap-3 p-6 pt-4 border-t border-[#334155] bg-[#0f172a]">
                    <button
                        type="button"
                        className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700"
                        onClick={handleSubmit}
                    >
                        Save changes
                    </button>
                </div>

            </div>
        </div>
    );
}
