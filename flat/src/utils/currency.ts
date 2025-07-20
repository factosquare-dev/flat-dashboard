export const formatCurrency = (value: number): string => {
  if (value === 0) return '0원';
  
  const jo = Math.floor(value / 1000000000000);
  const eok = Math.floor((value % 1000000000000) / 100000000);
  const man = Math.floor((value % 100000000) / 10000);
  const won = value % 10000;
  
  let result = '';
  
  // 조 단위
  if (jo > 0) {
    result += `${jo.toLocaleString()}조`;
  }
  
  // 억 단위
  if (eok > 0) {
    if (result) result += ' ';
    result += `${eok.toLocaleString()}억`;
  }
  
  // 만 단위
  if (man > 0) {
    if (result) result += ' ';
    result += `${man.toLocaleString()}만`;
  }
  
  // 원 단위 (조, 억, 만이 모두 없을 때만 표시)
  if (!result && won > 0) {
    result = won.toLocaleString();
  }
  
  return result + '원';
};

export const parseCurrency = (str: string): number => {
  // 숫자와 한국 단위만 남기고 제거
  str = str.replace(/[^0-9조억만,]/g, '');
  let total = 0;
  
  // 조 단위 처리
  const joMatch = str.match(/(\d+[\d,]*)조/);
  if (joMatch) {
    const joValue = parseInt(joMatch[1].replace(/,/g, ''));
    total += joValue * 1000000000000;
  }
  
  // 억 단위 처리
  const eokMatch = str.match(/(\d+[\d,]*)억/);
  if (eokMatch) {
    const eokValue = parseInt(eokMatch[1].replace(/,/g, ''));
    total += eokValue * 100000000;
  }
  
  // 만 단위 처리
  const manMatch = str.match(/(\d+[\d,]*)만/);
  if (manMatch) {
    const manValue = parseInt(manMatch[1].replace(/,/g, ''));
    total += manValue * 10000;
  }
  
  // 원 단위 처리 (단위가 없는 마지막 숫자)
  const wonMatch = str.match(/(\d+[\d,]*)$/);
  if (wonMatch && !str.includes('조') && !str.includes('억') && !str.includes('만')) {
    const wonValue = parseInt(wonMatch[1].replace(/,/g, ''));
    total += wonValue;
  }
  
  return total;
};