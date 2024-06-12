// import '@testing-library/jest-dom';
// import { render } from '@testing-library/react';
// import App from '../renderer/App';
// import { isVersionGreater } from '../renderer/services/system/controller';

// describe('App', () => {
//   it('should render', () => {
//     expect(render(<App />)).toBeTruthy();
//   });
// });

// describe('Version Comparison Tests', () => {
//   test('Standard version comparison where online version is greater', () => {
//     expect(isVersionGreater('1.0.1', '1.0.0')).toBe(true);
//   });

//   test('Standard version comparison where current version is greater', () => {
//     expect(isVersionGreater('1.0.0', '1.0.1')).toBe(false);
//   });

//   test('Beta version comparison with higher beta number', () => {
//     expect(isVersionGreater('1.0.0-beta.2', '1.0.0-beta.1')).toBe(true);
//   });

//   test('Beta version comparison with lower beta number', () => {
//     expect(isVersionGreater('1.0.0-beta.1', '1.0.0-beta.2')).toBe(false);
//   });

//   test('Beta versus stable where stable should be greater', () => {
//     expect(isVersionGreater('1.0.0', '1.0.0-beta.1')).toBe(true);
//   });

//   test('Stable versus beta where beta should be lesser', () => {
//     expect(isVersionGreater('1.0.0-beta.1', '1.0.0')).toBe(false);
//   });

//   test('Identical versions should not be greater', () => {
//     expect(isVersionGreater('1.0.0', '1.0.0')).toBe(false);
//   });

//   test('Beta suffix without number compared to numeric beta suffix', () => {
//     expect(isVersionGreater('1.0.0-beta', '1.0.0-beta.1')).toBe(false);
//   });

//   test('Numeric beta suffix compared to beta suffix without number', () => {
//     expect(isVersionGreater('1.0.0-beta.1', '1.0.0-beta')).toBe(true);
//   });

//   test('Beta version comparison with identical suffix and number', () => {
//     expect(isVersionGreater('1.0.0-beta.1', '1.0.0-beta.1')).toBe(false);
//   });
// });
