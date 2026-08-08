import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Ruler, CheckCircle2, Sparkles } from "lucide-react";

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: string;
  productCategory?: string;
}

export const SizeGuideModal: React.FC<SizeGuideModalProps> = ({
  isOpen,
  onClose,
  category,
  productCategory,
}) => {
  const effectiveCategory = productCategory || category || "Shirt";
  const [unit, setUnit] = useState<"in" | "cm">("in");
  const [activeType, setActiveType] = useState<"tops" | "bottoms">(
    effectiveCategory.toLowerCase().includes("pant") || effectiveCategory.toLowerCase().includes("trouser")
      ? "bottoms"
      : "tops"
  );

  const [userHeight, setUserHeight] = useState<number>(175); // in cm
  const [userWeight, setUserWeight] = useState<number>(70); // in kg
  const [calcResult, setCalcResult] = useState<string | null>(null);

  if (!isOpen) return null;

  const calculateFit = () => {
    if (userWeight < 60) setCalcResult("S (Small)");
    else if (userWeight < 72) setCalcResult("M (Medium)");
    else if (userWeight < 84) setCalcResult("L (Large)");
    else setCalcResult("XL (Extra Large)");
  };

  const topsData = [
    { size: "S", chest: unit === "in" ? "38 - 40" : "96 - 101", shoulder: unit === "in" ? "17.5" : "44.5", length: unit === "in" ? "28.5" : "72.5", sleeve: unit === "in" ? "24.5" : "62" },
    { size: "M", chest: unit === "in" ? "40 - 42" : "101 - 106", shoulder: unit === "in" ? "18.2" : "46.2", length: unit === "in" ? "29.2" : "74.2", sleeve: unit === "in" ? "25.0" : "63.5" },
    { size: "L", chest: unit === "in" ? "42 - 44" : "106 - 111", shoulder: unit === "in" ? "19.0" : "48.2", length: unit === "in" ? "30.0" : "76.2", sleeve: unit === "in" ? "25.5" : "64.8" },
    { size: "XL", chest: unit === "in" ? "44 - 46" : "111 - 117", shoulder: unit === "in" ? "19.8" : "50.2", length: unit === "in" ? "30.8" : "78.2", sleeve: unit === "in" ? "26.0" : "66" },
  ];

  const bottomsData = [
    { size: "S", waist: unit === "in" ? "28 - 30" : "71 - 76", hip: unit === "in" ? "38.0" : "96", inseam: unit === "in" ? "29.5" : "75", thigh: unit === "in" ? "24.0" : "61" },
    { size: "M", waist: unit === "in" ? "31 - 33" : "78 - 84", hip: unit === "in" ? "40.5" : "103", inseam: unit === "in" ? "30.0" : "76", thigh: unit === "in" ? "25.2" : "64" },
    { size: "L", waist: unit === "in" ? "34 - 36" : "86 - 91", hip: unit === "in" ? "43.0" : "109", inseam: unit === "in" ? "30.5" : "77.5", thigh: unit === "in" ? "26.5" : "67" },
    { size: "XL", waist: unit === "in" ? "37 - 39" : "94 - 99", hip: unit === "in" ? "45.5" : "115", inseam: unit === "in" ? "31.0" : "78.8", thigh: unit === "in" ? "27.8" : "70.5" },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[220] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#0B0D12]/60 backdrop-blur-xs cursor-pointer"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          className="relative w-full max-w-2xl bg-[#FAF9F5] border border-[#1C2333]/20 shadow-2xl rounded-sm p-6 sm:p-8 z-10 text-[#1C2333] max-h-[90vh] overflow-y-auto"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-[#1C2333]/60 hover:text-[#1C2333] hover:bg-[#1C2333]/5 rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 pb-4 border-b border-[#1C2333]/15">
            <Ruler className="w-6 h-6 text-[#1C2333]" />
            <div>
              <h3 className="font-serif text-xl font-bold uppercase tracking-wider text-[#1C2333]">
                PRECISION SIZE CHART & FIT GUIDE
              </h3>
              <p className="text-xs font-mono text-[#1C2333]/60 uppercase tracking-wider">
                TIRUPATI MERCHANDISE RELAXED UNSTRUCTURED CUTS
              </p>
            </div>
          </div>

          {/* Controls: Category Toggle & Unit Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-4 my-6">
            <div className="flex bg-[#1C2333]/10 p-1 rounded-sm">
              <button
                onClick={() => setActiveType("tops")}
                className={`px-4 py-1.5 text-xs font-mono uppercase tracking-wider rounded-xs font-bold transition cursor-pointer ${
                  activeType === "tops"
                    ? "bg-[#1C2333] text-[#FAF9F5]"
                    : "text-[#1C2333]/70 hover:text-[#1C2333]"
                }`}
              >
                SHIRTS & TOPS
              </button>
              <button
                onClick={() => setActiveType("bottoms")}
                className={`px-4 py-1.5 text-xs font-mono uppercase tracking-wider rounded-xs font-bold transition cursor-pointer ${
                  activeType === "bottoms"
                    ? "bg-[#1C2333] text-[#FAF9F5]"
                    : "text-[#1C2333]/70 hover:text-[#1C2333]"
                }`}
              >
                TROUSERS & PANTS
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#1C2333]/60 font-bold">
                UNITS:
              </span>
              <div className="flex bg-[#1C2333]/10 p-0.5 rounded-sm">
                <button
                  onClick={() => setUnit("in")}
                  className={`px-2.5 py-1 text-xs font-mono rounded-xs font-bold cursor-pointer ${
                    unit === "in" ? "bg-[#1C2333] text-white" : "text-[#1C2333]/60"
                  }`}
                >
                  INCHES
                </button>
                <button
                  onClick={() => setUnit("cm")}
                  className={`px-2.5 py-1 text-xs font-mono rounded-xs font-bold cursor-pointer ${
                    unit === "cm" ? "bg-[#1C2333] text-white" : "text-[#1C2333]/60"
                  }`}
                >
                  CM
                </button>
              </div>
            </div>
          </div>

          {/* Measurement Table */}
          <div className="overflow-x-auto border border-[#1C2333]/15 rounded-sm bg-white mb-6">
            <table className="w-full text-xs font-mono text-left border-collapse">
              <thead>
                <tr className="bg-[#1C2333] text-[#FAF9F5] border-b border-[#1C2333]">
                  <th className="p-3 font-bold uppercase tracking-wider border-r border-[#FAF9F5]/20">SIZE</th>
                  {activeType === "tops" ? (
                    <>
                      <th className="p-3 uppercase tracking-wider border-r border-[#FAF9F5]/20">CHEST ({unit})</th>
                      <th className="p-3 uppercase tracking-wider border-r border-[#FAF9F5]/20">SHOULDER ({unit})</th>
                      <th className="p-3 uppercase tracking-wider border-r border-[#FAF9F5]/20">LENGTH ({unit})</th>
                      <th className="p-3 uppercase tracking-wider">SLEEVE ({unit})</th>
                    </>
                  ) : (
                    <>
                      <th className="p-3 uppercase tracking-wider border-r border-[#FAF9F5]/20">WAIST ({unit})</th>
                      <th className="p-3 uppercase tracking-wider border-r border-[#FAF9F5]/20">HIP ({unit})</th>
                      <th className="p-3 uppercase tracking-wider border-r border-[#FAF9F5]/20">INSEAM ({unit})</th>
                      <th className="p-3 uppercase tracking-wider">THIGH ({unit})</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1C2333]/10 text-[#1C2333]">
                {activeType === "tops"
                  ? topsData.map((row) => (
                      <tr key={row.size} className="hover:bg-[#FAF9F5]">
                        <td className="p-3 font-bold border-r border-[#1C2333]/10 bg-[#FAF9F5]">{row.size}</td>
                        <td className="p-3 border-r border-[#1C2333]/10">{row.chest}</td>
                        <td className="p-3 border-r border-[#1C2333]/10">{row.shoulder}</td>
                        <td className="p-3 border-r border-[#1C2333]/10">{row.length}</td>
                        <td className="p-3">{row.sleeve}</td>
                      </tr>
                    ))
                  : bottomsData.map((row) => (
                      <tr key={row.size} className="hover:bg-[#FAF9F5]">
                        <td className="p-3 font-bold border-r border-[#1C2333]/10 bg-[#FAF9F5]">{row.size}</td>
                        <td className="p-3 border-r border-[#1C2333]/10">{row.waist}</td>
                        <td className="p-3 border-r border-[#1C2333]/10">{row.hip}</td>
                        <td className="p-3 border-r border-[#1C2333]/10">{row.inseam}</td>
                        <td className="p-3">{row.thigh}</td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>

          {/* Interactive Fit Calculator */}
          <div className="bg-[#1C2333]/5 p-5 border border-[#1C2333]/15 rounded-sm space-y-3 mb-6">
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#1C2333]">
              <Sparkles className="w-4 h-4 text-[#1C2333]" />
              <span>SMART FIT RECOMMENDATOR</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-mono text-[#1C2333]/70 uppercase font-bold mb-1">
                  YOUR HEIGHT: {userHeight} CM ({Math.floor(userHeight / 30.48)}'{Math.round((userHeight % 30.48) / 2.54)}")
                </label>
                <input
                  type="range"
                  min="150"
                  max="200"
                  value={userHeight}
                  onChange={(e) => setUserHeight(Number(e.target.value))}
                  className="w-full accent-[#1C2333]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-[#1C2333]/70 uppercase font-bold mb-1">
                  YOUR WEIGHT: {userWeight} KG ({Math.round(userWeight * 2.205)} LBS)
                </label>
                <input
                  type="range"
                  min="45"
                  max="110"
                  value={userWeight}
                  onChange={(e) => setUserWeight(Number(e.target.value))}
                  className="w-full accent-[#1C2333]"
                />
              </div>
            </div>
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={calculateFit}
                className="py-2 px-4 bg-[#1C2333] hover:bg-[#1C2333]/90 text-[#FAF9F5] text-[10px] font-mono uppercase tracking-widest font-bold rounded-xs cursor-pointer"
              >
                CALCULATE RECOMMENDED FIT
              </button>
              {calcResult && (
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-800 bg-emerald-100/80 px-3 py-1 rounded-xs border border-emerald-300">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>RECOMMENDED: {calcResult}</span>
                </div>
              )}
            </div>
          </div>

          {/* How to Measure Tip */}
          <div className="border-t border-[#1C2333]/15 pt-4 text-xs font-sans text-[#1C2333]/80 space-y-2">
            <h5 className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#1C2333]">
              HOW TO MEASURE YOUR BODY ACCURATELY:
            </h5>
            <ul className="list-disc pl-5 space-y-1 font-light text-[11px]">
              <li><strong>Chest / Bust:</strong> Measure around the fullest part of your chest, keeping the tape horizontal.</li>
              <li><strong>Waist:</strong> Measure around your natural waistline, where your trousers usually rest comfortably.</li>
              <li><strong>Hips:</strong> Stand with feet together and measure around the fullest part of your hips.</li>
            </ul>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
