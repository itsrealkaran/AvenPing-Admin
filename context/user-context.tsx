"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface UserInfo {
  whatsappAccount?: {
    id: string;
    name: string;
    email: string;
    phoneNumbers?: Array<{
      name: string;
      phoneNumber: string;
    }>;
    activePhoneNumber?: {
      name: string;
      phoneNumber: string;
    };
  };
}

interface UserContextType {
  userInfo: UserInfo | null;
  setActivePhoneNumber: (phoneNumber: string) => void;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  // Mock user data for demonstration
  useEffect(() => {
    setUserInfo({
      whatsappAccount: {
        id: "user_123",
        name: "Admin User",
        email: "admin@avenping.com",
        phoneNumbers: [
          {
            name: "Main Number",
            phoneNumber: "+1234567890"
          }
        ],
        activePhoneNumber: {
          name: "Main Number",
          phoneNumber: "+1234567890"
        }
      }
    });
  }, []);

  const setActivePhoneNumber = (phoneNumber: string) => {
    if (userInfo?.whatsappAccount?.phoneNumbers) {
      const selectedPhone = userInfo.whatsappAccount.phoneNumbers.find(
        phone => phone.phoneNumber === phoneNumber
      );
      
      if (selectedPhone) {
        setUserInfo(prev => ({
          ...prev,
          whatsappAccount: {
            ...prev?.whatsappAccount!,
            activePhoneNumber: selectedPhone
          }
        }));
      }
    }
  };

  const refreshUser = async () => {
    // Mock refresh - in real app, this would fetch from API
    console.log("Refreshing user data...");
  };

  const value: UserContextType = {
    userInfo,
    setActivePhoneNumber,
    refreshUser,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
