import React from 'react';
import { UserSettings } from '../types';
import { LoginComponent } from './LoginComponent';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  userSettings: UserSettings;
  onUpdateUserSettings: (updated: UserSettings) => void;
  onLogout?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  userSettings,
  onUpdateUserSettings,
  onLogout,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-md">
        <LoginComponent
          onClose={onClose}
          userSettings={userSettings}
          onUpdateUserSettings={onUpdateUserSettings}
          onSuccess={() => {
            onClose();
          }}
          onGuestMode={() => {
            onClose();
          }}
        />
      </div>
    </div>
  );
};
