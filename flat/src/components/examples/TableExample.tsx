import React, { useState } from 'react';
import { Table } from '../common/CompoundTable';
import { Users } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
}

const users: User[] = [
  { id: '1', name: '김철수', email: 'kim@example.com', role: '관리자', status: 'active' },
  { id: '2', name: '이영희', email: 'lee@example.com', role: '사용자', status: 'active' },
  { id: '3', name: '박민수', email: 'park@example.com', role: '사용자', status: 'inactive' },
];

/**
 * Example of using Compound Table Pattern
 */
const TableExample: React.FC = () => {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [sortField, setSortField] = useState<keyof User | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isLoading, setIsLoading] = useState(false);

  const handleSort = (field: keyof User) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleRowClick = (userId: string) => {
    setSelectedRows(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">사용자 목록</h2>
      
      <Table 
        striped 
        hoverable 
        selectable
        compact={false}
      >
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell width={50}>
              <input 
                type="checkbox" 
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedRows(users.map(u => u.id));
                  } else {
                    setSelectedRows([]);
                  }
                }}
                checked={selectedRows.length === users.length}
              />
            </Table.HeaderCell>
            <Table.HeaderCell 
              sortable 
              sorted={sortField === 'name' ? sortDirection : false}
              onSort={() => handleSort('name')}
            >
              이름
            </Table.HeaderCell>
            <Table.HeaderCell 
              sortable 
              sorted={sortField === 'email' ? sortDirection : false}
              onSort={() => handleSort('email')}
            >
              이메일
            </Table.HeaderCell>
            <Table.HeaderCell>역할</Table.HeaderCell>
            <Table.HeaderCell align="center">상태</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {isLoading ? (
            <Table.Loading columns={5} rows={3} />
          ) : users.length === 0 ? (
            <Table.Empty 
              message="등록된 사용자가 없습니다" 
              icon={<Users className="w-12 h-12 text-gray-400" />}
            />
          ) : (
            users.map(user => (
              <Table.Row 
                key={user.id}
                selected={selectedRows.includes(user.id)}
                onClick={() => handleRowClick(user.id)}
              >
                <Table.Cell>
                  <input 
                    type="checkbox" 
                    checked={selectedRows.includes(user.id)}
                    onChange={(e) => e.stopPropagation()}
                  />
                </Table.Cell>
                <Table.Cell>{user.name}</Table.Cell>
                <Table.Cell>{user.email}</Table.Cell>
                <Table.Cell>{user.role}</Table.Cell>
                <Table.Cell align="center">
                  <span className={`badge ${
                    user.status === 'active' ? 'badge-success' : 'badge-default'
                  }`}>
                    {user.status === 'active' ? '활성' : '비활성'}
                  </span>
                </Table.Cell>
              </Table.Row>
            ))
          )}
        </Table.Body>
      </Table>
    </div>
  );
};

export default TableExample;