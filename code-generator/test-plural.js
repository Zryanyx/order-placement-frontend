import { toKebab, toPlural } from './core/utils.js';

console.log('UserAddress 转换为复数形式:');
console.log('toKebab("UserAddress", true):', toKebab('UserAddress', true));
console.log('toKebab("UserAddress", false):', toKebab('UserAddress', false));
console.log('toPlural("user-address"):', toPlural('user-address'));

console.log('\nCategory 转换为复数形式:');
console.log('toKebab("Category", true):', toKebab('Category', true));
console.log('toKebab("Category", false):', toKebab('Category', false));
console.log('toPlural("category"):', toPlural('category'));