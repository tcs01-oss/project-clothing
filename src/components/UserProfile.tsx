import React, { useState } from "react";
import { User, MapPin, Bell, Plus, Trash2, CheckCircle2, Shield, Edit3, Save } from "lucide-react";

export interface AddressItem {
  id: string;
  label: string; // e.g. Home, Work, Vacation
  fullName: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  isDefault: boolean;
}

interface UserProfileProps {
  currentUser: any;
  onUpdateProfile: (updatedData: any) => void;
  onOpenOrders: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  currentUser,
  onUpdateProfile,
  onOpenOrders,
}) => {
  const [activeTab, setActiveTab] = useState<"profile" | "addresses" | "notifications">("profile");

  // Profile Form State
  const [name, setName] = useState(currentUser?.name || "Linen Nomad");
  const [email, setEmail] = useState(currentUser?.email || "support@tirupatimerchandise.com");
  const [phone, setPhone] = useState(currentUser?.phone ? currentUser.phone.replace(/\D/g, "").slice(-10) : "0000000000");
  const [gender, setGender] = useState(currentUser?.gender || "Unspecified");
  const [profileSaved, setProfileSaved] = useState(false);

  // Addresses State
  const [addresses, setAddresses] = useState<AddressItem[]>([
    {
      id: "addr-1",
      label: "Home / Permanent",
      fullName: currentUser?.name || "Linen Nomad",
      street: "148 Salt Lake Sector 5, Block EP & GP",
      city: "Kolkata",
      state: "West Bengal",
      pincode: "700091",
      phone: "0000000000",
      isDefault: true,
    },
    {
      id: "addr-2",
      label: "Workplace / Office",
      fullName: currentUser?.name || "Linen Nomad",
      street: "Bandra Kurla Complex, Tower B",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400051",
      phone: "0000000000",
      isDefault: false,
    },
  ]);

  const [showAddAddr, setShowAddAddr] = useState(false);
  const [newAddr, setNewAddr] = useState<Partial<AddressItem>>({
    label: "Home",
    fullName: name,
    street: "",
    city: "",
    state: "",
    pincode: "",
    phone: phone,
    isDefault: false,
  });

  // Notification Preferences State
  const [notifications, setNotifications] = useState({
    emailOrders: true,
    smsShipping: true,
    whatsappTracking: true,
    promotions: true,
    newsletter: true,
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({ name, email, phone, gender });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddr.street || !newAddr.city || !newAddr.pincode) return;

    const created: AddressItem = {
      id: `addr-${Date.now()}`,
      label: newAddr.label || "Address",
      fullName: newAddr.fullName || name,
      street: newAddr.street || "",
      city: newAddr.city || "",
      state: newAddr.state || "",
      pincode: newAddr.pincode || "",
      phone: newAddr.phone || phone,
      isDefault: addresses.length === 0 ? true : !!newAddr.isDefault,
    };

    if (created.isDefault) {
      setAddresses(addresses.map((a) => ({ ...a, isDefault: false })).concat(created));
    } else {
      setAddresses([...addresses, created]);
    }

    setShowAddAddr(false);
    setNewAddr({ label: "Home", fullName: name, street: "", city: "", state: "", pincode: "", phone: phone });
  };

  const setDefaultAddress = (id: string) => {
    setAddresses(addresses.map((a) => ({ ...a, isDefault: a.id === id })));
  };

  const deleteAddress = (id: string) => {
    setAddresses(addresses.filter((a) => a.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 text-left space-y-8 text-[#1C2333]">
      {/* Account Header Badge */}
      <div className="p-6 bg-white border border-[#1C2333]/15 rounded-sm flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#1C2333] text-[#FAF9F5] flex items-center justify-center font-serif text-2xl font-bold">
            {name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="font-serif text-xl font-bold text-[#1C2333] uppercase tracking-wider">{name}</h2>
            <p className="font-mono text-xs text-[#1C2333]/60">{email}</p>
            <span className="inline-block mt-1 text-[9px] font-mono bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-xs font-bold uppercase">
              VIP NOMAD MEMBER
            </span>
          </div>
        </div>

        <button
          onClick={onOpenOrders}
          className="py-2.5 px-5 bg-[#1C2333] hover:bg-[#1C2333]/90 text-[#FAF9F5] text-xs font-mono uppercase tracking-widest font-bold rounded-xs cursor-pointer"
        >
          VIEW MY ORDERS & TRACKING
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#1C2333]/15 bg-white rounded-t-sm">
        {[
          { id: "profile", label: "PERSONAL DETAILS", icon: User },
          { id: "addresses", label: "SHIPPING ADDRESSES", icon: MapPin },
          { id: "notifications", label: "NOTIFICATIONS", icon: Bell },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex-1 py-3.5 text-center text-xs font-mono uppercase tracking-widest font-bold border-b-2 flex items-center justify-center gap-2 cursor-pointer transition ${
                isActive
                  ? "border-[#1C2333] text-[#1C2333] bg-[#FAF9F5]"
                  : "border-transparent text-[#1C2333]/50 hover:text-[#1C2333]"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Personal Profile Info */}
      {activeTab === "profile" && (
        <form onSubmit={handleSaveProfile} className="p-6 bg-white border border-[#1C2333]/15 rounded-b-sm space-y-5 animate-fadeIn">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-[#1C2333]/70 font-bold mb-1.5">
                FULL NAME
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 bg-white border border-[#1C2333]/20 text-xs font-mono text-[#1C2333] focus:outline-none focus:border-[#1C2333] rounded-xs"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-[#1C2333]/70 font-bold mb-1.5">
                EMAIL ADDRESS
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2.5 bg-white border border-[#1C2333]/20 text-xs font-mono text-[#1C2333] focus:outline-none focus:border-[#1C2333] rounded-xs"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-[#1C2333]/70 font-bold mb-1.5">
                PHONE NUMBER
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2.5 bg-white border border-[#1C2333]/20 text-xs font-mono text-[#1C2333] focus:outline-none focus:border-[#1C2333] rounded-xs"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-[#1C2333]/70 font-bold mb-1.5">
                GENDER PREFERENCE
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full p-2.5 bg-white border border-[#1C2333]/20 text-xs font-mono text-[#1C2333] focus:outline-none focus:border-[#1C2333] rounded-xs"
              >
                <option value="Unspecified">Prefer Not To Say</option>
                <option value="Male">Men's Wardrobe Focus</option>
                <option value="Female">Women's Wardrobe Focus</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#1C2333]/10">
            {profileSaved ? (
              <span className="text-xs font-mono text-emerald-800 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> PROFILE UPDATED SUCCESSFULLY
              </span>
            ) : (
              <span className="text-[10px] font-mono text-[#1C2333]/50">SECURED WITH 256-BIT ENCRYPTION</span>
            )}

            <button
              type="submit"
              className="py-2.5 px-6 bg-[#1C2333] hover:bg-[#1C2333]/90 text-[#FAF9F5] text-xs font-mono uppercase tracking-widest font-bold rounded-xs cursor-pointer flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>SAVE CHANGES</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: Addresses Manager */}
      {activeTab === "addresses" && (
        <div className="p-6 bg-white border border-[#1C2333]/15 rounded-b-sm space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h4 className="font-mono text-xs font-bold text-[#1C2333] uppercase tracking-wider">
              SAVED SHIPPING DESTINATIONS ({addresses.length})
            </h4>
            <button
              type="button"
              onClick={() => setShowAddAddr(!showAddAddr)}
              className="py-1.5 px-3 bg-[#1C2333] text-white text-[10px] font-mono uppercase tracking-wider font-bold rounded-xs cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>ADD NEW ADDRESS</span>
            </button>
          </div>

          {/* Add Address Form */}
          {showAddAddr && (
            <form onSubmit={handleAddAddress} className="p-4 bg-[#FAF9F5] border border-[#1C2333]/20 rounded-sm space-y-4">
              <h5 className="font-serif text-sm font-bold text-[#1C2333] uppercase">ADD DESTINATION ADDRESS</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Address Label (e.g., Home, Work)"
                  required
                  value={newAddr.label}
                  onChange={(e) => setNewAddr({ ...newAddr, label: e.target.value })}
                  className="p-2 bg-white border border-[#1C2333]/20 text-xs font-mono text-[#1C2333] rounded-xs"
                />
                <input
                  type="text"
                  placeholder="Full Recipient Name"
                  required
                  value={newAddr.fullName}
                  onChange={(e) => setNewAddr({ ...newAddr, fullName: e.target.value })}
                  className="p-2 bg-white border border-[#1C2333]/20 text-xs font-mono text-[#1C2333] rounded-xs"
                />
                <input
                  type="text"
                  placeholder="Street / House No. / Area"
                  required
                  value={newAddr.street}
                  onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                  className="p-2 bg-white border border-[#1C2333]/20 text-xs font-mono text-[#1C2333] rounded-xs sm:col-span-2"
                />
                <input
                  type="text"
                  placeholder="City"
                  required
                  value={newAddr.city}
                  onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                  className="p-2 bg-white border border-[#1C2333]/20 text-xs font-mono text-[#1C2333] rounded-xs"
                />
                <input
                  type="text"
                  placeholder="State"
                  required
                  value={newAddr.state}
                  onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                  className="p-2 bg-white border border-[#1C2333]/20 text-xs font-mono text-[#1C2333] rounded-xs"
                />
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  placeholder="Pincode (6 digits)"
                  required
                  value={newAddr.pincode}
                  onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })}
                  className="p-2 bg-white border border-[#1C2333]/20 text-xs font-mono text-[#1C2333] rounded-xs"
                />
                <input
                  type="tel"
                  placeholder="Contact Mobile"
                  required
                  value={newAddr.phone}
                  onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                  className="p-2 bg-white border border-[#1C2333]/20 text-xs font-mono text-[#1C2333] rounded-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddAddr(false)}
                  className="py-2 px-4 bg-gray-200 text-[#1C2333] text-xs font-mono uppercase font-bold rounded-xs cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="py-2 px-5 bg-[#1C2333] text-white text-xs font-mono uppercase font-bold rounded-xs cursor-pointer"
                >
                  SAVE ADDRESS
                </button>
              </div>
            </form>
          )}

          {/* Address Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {addresses.map((a) => (
              <div
                key={a.id}
                className={`p-4 rounded-sm border text-left space-y-2 relative transition ${
                  a.isDefault ? "bg-[#FAF9F5] border-[#1C2333]" : "bg-white border-[#1C2333]/15"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold uppercase text-[#1C2333]">{a.label}</span>
                  {a.isDefault ? (
                    <span className="text-[9px] font-mono bg-[#1C2333] text-white px-2 py-0.5 rounded-xs uppercase font-bold">
                      DEFAULT DESTINATION
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setDefaultAddress(a.id)}
                      className="text-[9px] font-mono text-[#1C2333]/60 hover:text-[#1C2333] underline cursor-pointer"
                    >
                      SET DEFAULT
                    </button>
                  )}
                </div>

                <p className="font-serif text-xs font-semibold text-[#1C2333]">{a.fullName}</p>
                <p className="font-mono text-[11px] text-[#1C2333]/70 leading-relaxed">
                  {a.street}, {a.city}, {a.state} - {a.pincode}
                </p>
                <p className="font-mono text-[10px] text-[#1C2333]/60">Phone: {a.phone}</p>

                <div className="pt-2 flex justify-end border-t border-[#1C2333]/10">
                  <button
                    type="button"
                    onClick={() => deleteAddress(a.id)}
                    className="text-red-700 hover:text-red-900 text-[10px] font-mono uppercase flex items-center gap-1 cursor-pointer font-bold"
                  >
                    <Trash2 className="w-3 h-3" /> REMOVE
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Notifications */}
      {activeTab === "notifications" && (
        <div className="p-6 bg-white border border-[#1C2333]/15 rounded-b-sm space-y-5 animate-fadeIn">
          <h4 className="font-mono text-xs font-bold text-[#1C2333] uppercase tracking-wider">
            COMMUNICATION PREFERENCES
          </h4>

          <div className="space-y-4 divide-y divide-[#1C2333]/10">
            {[
              { key: "emailOrders", label: "Email Order Confirmations & Invoices", desc: "Receive immediate order receipts & tracking details via email" },
              { key: "smsShipping", label: "SMS Shipment Alerts", desc: "Get real-time SMS alerts when courier is out for delivery" },
              { key: "whatsappTracking", label: "WhatsApp Order Updates", desc: "Receive interactive WhatsApp messages with direct live map tracking links" },
              { key: "promotions", label: "VIP Private Sale & Drop Alerts", desc: "Early access notifications for limited loom artisan drops" },
            ].map((item) => (
              <div key={item.key} className="pt-3 flex items-center justify-between gap-4">
                <div>
                  <span className="font-serif text-sm font-semibold text-[#1C2333] block">{item.label}</span>
                  <span className="font-mono text-[10px] text-[#1C2333]/60 block">{item.desc}</span>
                </div>
                <input
                  type="checkbox"
                  checked={(notifications as any)[item.key]}
                  onChange={(e) =>
                    setNotifications({ ...notifications, [item.key]: e.target.checked })
                  }
                  className="w-4 h-4 accent-[#1C2333] cursor-pointer shrink-0"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
