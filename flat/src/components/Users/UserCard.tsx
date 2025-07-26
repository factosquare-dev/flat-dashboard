import React, { useState, useCallback, useMemo } from 'react';
import { MoreVertical, User } from 'lucide-react';
import { useClickOutside } from '../../hooks/useClickOutside';
import { cn } from '../../utils/classNames';
import type { UserRole } from '../../store/slices/userSlice';
import styles from './UserCard.module.css';

export interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  department?: string;
  position?: string;
}

interface UserCardProps {
  user: UserData;
  onEdit: (user: UserData) => void;
  onDelete: (userId: string) => void;
}

const UserCard: React.FC<UserCardProps> = React.memo(({ user, onEdit, onDelete }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // 외부 클릭 감지 - custom hook 사용
  const dropdownRef = useClickOutside<HTMLDivElement>(
    useCallback(() => setIsDropdownOpen(false), []),
    isDropdownOpen
  );

  const handleEdit = useCallback(() => {
    onEdit(user);
    setIsDropdownOpen(false);
  }, [onEdit, user]);

  const handleDelete = useCallback(() => {
    if (confirm(`정말로 ${user.name}님을 삭제하시겠습니까?`)) {
      onDelete(user.id);
    }
    setIsDropdownOpen(false);
  }, [onDelete, user.id, user.name]);

  const roleDisplay = useMemo(() => {
    switch (user.role) {
      case 'admin':
        return { text: '관리자', className: styles.roleAdmin };
      case 'manager':
        return { text: '매니저', className: styles.roleManager };
      case 'customer':
        return { text: '고객', className: styles.roleCustomer };
      default:
        return { text: user.role, className: styles.roleDefault };
    }
  }, [user.role]);

  return (
    <div className={styles.card}>
      {/* 카드 헤더 */}
      <div className={styles.cardHeader}>
        <div className={styles.headerContent}>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>
              <User className={styles.avatarText} />
            </div>
            <div>
              <h3 className={styles.userName}>{user.name}</h3>
              <span className={cn(styles.roleTag, roleDisplay.className)}>
                {roleDisplay.text}
              </span>
            </div>
          </div>
          
          {/* 드롭다운 메뉴 */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={useCallback(() => setIsDropdownOpen(prev => !prev), [])}
              className={styles.dropdownButton}
              aria-label="옵션 메뉴"
              aria-expanded={isDropdownOpen}
              aria-haspopup="true"
            >
              <MoreVertical className={styles.dropdownIcon} />
            </button>
            
            {isDropdownOpen && (
              <div className={styles.dropdownMenu}>
                <button
                  onClick={handleEdit}
                  className={styles.dropdownItem}
                >
                  수정
                </button>
                <button
                  onClick={handleDelete}
                  className={styles.dropdownItemDelete}
                >
                  삭제
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* 카드 바디 */}
      <div className={styles.cardBody}>
        <div className={styles.infoSection}>
          {(user.department || user.position) && (
            <div className="text-sm">
              <span className={styles.infoLabel}>소속: </span>
              <span className={styles.infoText}>
                {user.department}
                {user.position && ` · ${user.position}`}
              </span>
            </div>
          )}
          
          <div className="text-sm">
            <span className={styles.infoLabel}>이메일: </span>
            <a 
              href={`mailto:${user.email}`} 
              className={styles.infoLinkTruncate}
              title={user.email}
            >
              {user.email}
            </a>
          </div>
          
          <div className="text-sm">
            <span className={styles.infoLabel}>연락처: </span>
            <a 
              href={`tel:${user.phone}`} 
              className={styles.infoLink}
            >
              {user.phone}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
});

UserCard.displayName = 'UserCard';

export default UserCard;