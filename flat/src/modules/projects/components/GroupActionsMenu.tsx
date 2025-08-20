import React, { useState } from 'react';
import { MoreVertical, FolderPlus, Folder, Edit2, Trash2, FolderOpen } from 'lucide-react';

interface GroupActionsMenuProps {
  onCreateGroup: (name: string, projectIds: string[]) => void;
  onAddToGroup: (groupId: string, projectIds: string[]) => void;
  onRemoveFromGroup: (projectIds: string[]) => void;
  onRenameGroup: (groupId: string, newName: string) => void;
  onDeleteGroup: (groupId: string) => void;
  selectedProjectIds: string[];
  currentGroupId?: string | null;
  groups: Array<{ id: string; name: string; projectIds: string[] }>;
}

const GroupActionsMenu: React.FC<GroupActionsMenuProps> = ({
  onCreateGroup,
  onAddToGroup,
  onRemoveFromGroup,
  onRenameGroup,
  onDeleteGroup,
  selectedProjectIds,
  currentGroupId,
  groups
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [renameGroupId, setRenameGroupId] = useState('');
  const [renameValue, setRenameValue] = useState('');

  const handleCreateGroup = () => {
    if (newGroupName.trim()) {
      onCreateGroup(newGroupName.trim(), selectedProjectIds);
      setNewGroupName('');
      setShowCreateModal(false);
      setIsOpen(false);
    }
  };

  const handleRename = () => {
    if (renameValue.trim() && renameGroupId) {
      onRenameGroup(renameGroupId, renameValue.trim());
      setRenameValue('');
      setRenameGroupId('');
      setShowRenameModal(false);
      setIsOpen(false);
    }
  };

  const handleAddToGroup = (groupId: string) => {
    onAddToGroup(groupId, selectedProjectIds);
    setIsOpen(false);
  };

  const otherGroups = groups.filter(g => g.id !== currentGroupId);

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        disabled={selectedProjectIds.length === 0}
      >
        <Folder className="w-5 h-5 text-gray-600" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            <div className="py-1">
              <button
                onClick={() => setShowCreateModal(true)}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
              >
                <FolderPlus className="w-4 h-4" />
                새 그룹 만들기
              </button>

              {currentGroupId && (
                <button
                  onClick={() => onRemoveFromGroup(selectedProjectIds)}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  <FolderOpen className="w-4 h-4" />
                  그룹에서 제외
                </button>
              )}

              {otherGroups.length > 0 && (
                <>
                  <div className="border-t border-gray-100 my-1" />
                  <div className="px-4 py-1 text-xs text-gray-500">다른 그룹으로 이동</div>
                  {otherGroups.map(group => (
                    <button
                      key={group.id}
                      onClick={() => handleAddToGroup(group.id)}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Folder className="w-4 h-4" />
                      {group.name} ({group.projectIds.length})
                    </button>
                  ))}
                </>
              )}

              {currentGroupId && (
                <>
                  <div className="border-t border-gray-100 my-1" />
                  <button
                    onClick={() => {
                      const group = groups.find(g => g.id === currentGroupId);
                      if (group) {
                        setRenameGroupId(currentGroupId);
                        setRenameValue(group.name);
                        setShowRenameModal(true);
                      }
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    그룹 이름 변경
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('이 그룹을 삭제하시겠습니까?')) {
                        onDeleteGroup(currentGroupId);
                      }
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                    그룹 삭제
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">새 그룹 만들기</h3>
            <input
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="그룹 이름"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
              onKeyPress={(e) => e.key === 'Enter' && handleCreateGroup()}
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewGroupName('');
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
              >
                취소
              </button>
              <button
                onClick={handleCreateGroup}
                disabled={!newGroupName.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                만들기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rename Group Modal */}
      {showRenameModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">그룹 이름 변경</h3>
            <input
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              placeholder="새 그룹 이름"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
              onKeyPress={(e) => e.key === 'Enter' && handleRename()}
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowRenameModal(false);
                  setRenameValue('');
                  setRenameGroupId('');
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
              >
                취소
              </button>
              <button
                onClick={handleRename}
                disabled={!renameValue.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                변경
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupActionsMenu;