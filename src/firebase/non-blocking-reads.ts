
'use client';
    
import {
  getDoc,
  getDocs,
  DocumentReference,
  CollectionReference,
  Query,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import type { InternalQuery } from './firestore/use-collection';

/**
 * Initiates a getDoc operation for a document reference.
 * Does NOT await the read operation internally but returns the promise.
 * Catches permission errors and emits them.
 */
export function getDocumentNonBlocking(docRef: DocumentReference) {
  const promise = getDoc(docRef)
    .catch(error => {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: docRef.path,
          operation: 'get',
        })
      );
      // Propagate null on error to signal failure to the caller
      return null;
    });
  return promise;
}


/**
 * Initiates a getDocs operation for a collection or query reference.
 * Does NOT await the read operation internally but returns the promise.
 * Catches permission errors and emits them.
 */
export function getCollectionNonBlocking(query: CollectionReference | Query) {
  const path = query.type === 'collection'
    ? (query as CollectionReference).path
    : (query as unknown as InternalQuery)._query.path.canonicalString()
    
  const promise = getDocs(query)
    .catch(error => {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: path,
          operation: 'list',
        })
      );
       // Propagate null on error to signal failure to the caller
      return null;
    });
  return promise;
}
