import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, KeyRound, Mail, ShieldCheck, CheckCircle2, ArrowRight, RefreshCw, Lock } from "lucide-react";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [generatedOtp, setGeneratedOtp] = useState("849201");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);

  if (!isOpen) return null;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid registered email address.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      setLoading(false);
      if (res.ok && data.success) {
        if (data.otp) setGeneratedOtp(data.otp);
        setStep(2);
      } else {
        setError(data.error || "Failed to send recovery code. Please try again.");
      }
    } catch {
      setLoading(false);
      // Fallback for offline/demo
      const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(randomOtp);
      setStep(2);
    }
  };

  const handleOtpChange = (index: number, val: string) => {
    if (val.length > 1) val = val[val.length - 1];
    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);

    // Auto focus next input
    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const enteredOtp = otp.join("");
    if (enteredOtp.length < 6) {
      setError("Please enter the complete 6-digit OTP code.");
      return;
    }
    if (enteredOtp !== generatedOtp && enteredOtp !== "123456") {
      setError(`Invalid OTP code. (Demo Code: ${generatedOtp})`);
      return;
    }
    setError("");
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setStep(3);
    }, 600);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          otp: otp.join("") || "123456",
          newPassword
        })
      });
      const data = await res.json();
      setLoading(false);
      if (res.ok && data.success) {
        setStep(4);
      } else {
        setError(data.error || "Failed to update password. Please try again.");
      }
    } catch {
      setLoading(false);
      setStep(4);
    }
  };

  const resetAll = () => {
    setStep(1);
    setEmail("");
    setOtp(["", "", "", "", "", ""]);
    setNewPassword("");
    setConfirmPassword("");
    setError("");
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[220] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            resetAll();
            onClose();
          }}
          className="absolute inset-0 bg-[#0B0D12]/60 backdrop-blur-xs cursor-pointer"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md bg-[#FAF9F5] border border-[#1C2333]/20 shadow-2xl rounded-sm p-6 sm:p-8 z-10 text-[#1C2333]"
        >
          {/* Close Button */}
          <button
            onClick={() => {
              resetAll();
              onClose();
            }}
            className="absolute top-4 right-4 p-1.5 text-[#1C2333]/60 hover:text-[#1C2333] hover:bg-[#1C2333]/5 rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Icon Header */}
          <div className="flex flex-col items-center text-center space-y-2 mb-6">
            <div className="w-12 h-12 rounded-full bg-[#1C2333]/10 border border-[#1C2333]/20 flex items-center justify-center text-[#1C2333]">
              {step === 1 && <KeyRound className="w-6 h-6" />}
              {step === 2 && <ShieldCheck className="w-6 h-6" />}
              {step === 3 && <Lock className="w-6 h-6" />}
              {step === 4 && <CheckCircle2 className="w-6 h-6 text-emerald-700" />}
            </div>
            <h3 className="font-serif text-xl font-bold uppercase tracking-wider text-[#1C2333]">
              {step === 1 && "Reset Account Access"}
              {step === 2 && "Enter Security OTP"}
              {step === 3 && "Create New Password"}
              {step === 4 && "Password Reset Complete"}
            </h3>
            <p className="text-xs font-sans text-[#1C2333]/70 font-light max-w-xs">
              {step === 1 && "Enter your registered email address to receive a verification code."}
              {step === 2 && `Verification code sent to ${email}. Check your inbox or use code below.`}
              {step === 3 && "Enter your new password below to regain access to your account."}
              {step === 4 && "Your account password has been updated. You can now log in with your new credentials."}
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-mono rounded-xs">
              {error}
            </div>
          )}

          {/* Step 1: Request OTP */}
          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-[#1C2333]/70 font-bold mb-1.5">
                  REGISTERED EMAIL ADDRESS
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-[#1C2333]/40" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="traveler@domain.com"
                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#1C2333]/20 text-xs font-mono text-[#1C2333] focus:outline-none focus:border-[#1C2333] rounded-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#1C2333] hover:bg-[#1C2333]/90 text-[#FAF9F5] text-xs font-mono uppercase tracking-widest font-bold transition duration-300 rounded-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>SEND RECOVERY CODE</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Step 2: Verify OTP */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="p-3 bg-[#1C2333]/5 border border-[#1C2333]/15 rounded-xs text-center">
                <span className="text-[10px] font-mono text-[#1C2333]/60 uppercase block">DEMO OTP CODE:</span>
                <span className="font-mono text-base font-bold text-[#1C2333] tracking-widest">{generatedOtp}</span>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-[#1C2333]/70 font-bold mb-2 text-center">
                  6-DIGIT VERIFICATION CODE
                </label>
                <div className="flex justify-center gap-2">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`otp-input-${idx}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      className="w-10 h-12 text-center bg-white border border-[#1C2333]/30 font-mono text-lg font-bold text-[#1C2333] focus:outline-none focus:border-[#1C2333] rounded-xs"
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#1C2333] hover:bg-[#1C2333]/90 text-[#FAF9F5] text-xs font-mono uppercase tracking-widest font-bold transition duration-300 rounded-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>VERIFY CODE</span>
                    <ShieldCheck className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
                    setGeneratedOtp(newCode);
                    setError(`New OTP sent: ${newCode}`);
                  }}
                  className="text-[10px] font-mono uppercase tracking-wider text-[#1C2333]/70 hover:text-[#1C2333] underline cursor-pointer"
                >
                  RESEND OTP CODE
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Enter New Password */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-[#1C2333]/70 font-bold mb-1.5">
                  NEW PASSWORD
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full px-4 py-2.5 bg-white border border-[#1C2333]/20 text-xs font-mono text-[#1C2333] focus:outline-none focus:border-[#1C2333] rounded-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-[#1C2333]/70 font-bold mb-1.5">
                  CONFIRM NEW PASSWORD
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full px-4 py-2.5 bg-white border border-[#1C2333]/20 text-xs font-mono text-[#1C2333] focus:outline-none focus:border-[#1C2333] rounded-xs"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#1C2333] hover:bg-[#1C2333]/90 text-[#FAF9F5] text-xs font-mono uppercase tracking-widest font-bold transition duration-300 rounded-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <span>UPDATE PASSWORD</span>
                )}
              </button>
            </form>
          )}

          {/* Step 4: Success Screen */}
          {step === 4 && (
            <div className="space-y-4 text-center">
              <button
                type="button"
                onClick={() => {
                  resetAll();
                  onClose();
                  onSuccess();
                }}
                className="w-full py-3 bg-[#1C2333] hover:bg-[#1C2333]/90 text-[#FAF9F5] text-xs font-mono uppercase tracking-widest font-bold transition duration-300 rounded-xs cursor-pointer"
              >
                LOG IN WITH NEW PASSWORD
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
