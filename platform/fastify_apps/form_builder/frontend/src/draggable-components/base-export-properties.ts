import { FieldType } from '../types';
import { ExportProperties } from './types';

// Base export properties for each field type
// These provide default static properties for ingesting apps
export const baseExportProperties: Record<FieldType, ExportProperties> = {
  text: {
    htmlTag: 'input',
    inputType: 'text',
    dataType: 'string',
  },
  textarea: {
    htmlTag: 'textarea',
    inputType: 'text',
    dataType: 'string',
    multiline: true,
  },
  select: {
    htmlTag: 'select',
    inputType: 'dropdown',
    dataType: 'string',
    selectionMode: 'single',
  },
  radio: {
    htmlTag: 'input',
    inputType: 'radio',
    dataType: 'string',
    selectionMode: 'single',
  },
  checkbox: {
    htmlTag: 'input',
    inputType: 'checkbox',
    dataType: 'array',
    selectionMode: 'multiple',
  },
  grid: {
    htmlTag: 'table',
    inputType: 'matrix',
    dataType: 'object',
    selectionMode: 'multiple',
  },
  date: {
    htmlTag: 'input',
    inputType: 'date',
    dataType: 'date',
    format: 'ISO8601',
  },
  number: {
    htmlTag: 'input',
    inputType: 'number',
    dataType: 'number',
  },
  upload: {
    htmlTag: 'input',
    inputType: 'file',
    dataType: 'binary',
    category: 'file',
  },
  image: {
    htmlTag: 'input',
    inputType: 'file',
    dataType: 'binary',
    category: 'image',
  },
  color: {
    htmlTag: 'input',
    inputType: 'color',
    dataType: 'string',
    format: 'hex',
  },
  geolocation: {
    htmlTag: 'div',
    inputType: 'map',
    dataType: 'object',
    format: 'geojson',
  },
};
