// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './styles.scss';

// external imports
import React, { useCallback, useEffect, useState } from 'react';
import { Route, Switch } from 'react-router';
import { useLocation } from 'react-router-dom';
import Header from 'semantic-ui-react/dist/commonjs/elements/Header/Header';
import Loader from 'semantic-ui-react/dist/commonjs/elements/Loader';

import envConfig from '@polkadot/apps-config/envConfig';
import { NftDetails } from '@polkadot/react-components';
// local imports and components
import { AppProps as Props } from '@polkadot/react-components/types';
import { useApi } from '@polkadot/react-hooks';
import { NftCollectionInterface } from '@polkadot/react-hooks/useCollection';

import NftWallet from './containers/NftWallet';

const { canAddCollections } = envConfig;

function PageNftWallet ({ account, basePath, openPanel, setOpenPanel }: Props): React.ReactElement<Props> {
  const location = useLocation();
  const { isApiConnected, isApiReady } = useApi();
  const [shouldUpdateTokens, setShouldUpdateTokens] = useState<string>();
  const collectionsStorage: NftCollectionInterface[] = JSON.parse(localStorage.getItem('tokenCollections') || '[]') as NftCollectionInterface[];
  const [collections, setCollections] = useState<NftCollectionInterface[]>(collectionsStorage);

  const addCollection = useCallback((collection: NftCollectionInterface) => {
    setCollections((prevCollections: NftCollectionInterface[]) => {
      let newCollections = [...prevCollections];

      if (!prevCollections.find((prevCollection) => prevCollection.id === collection.id)) {
        newCollections = [...prevCollections, collection];
      }

      localStorage.setItem('tokenCollections', JSON.stringify(newCollections));

      return newCollections;
    });
  }, []);

  const removeCollectionFromList = useCallback((collectionToRemove: string) => {
    const newCollectionList = collections.filter((item: NftCollectionInterface) => item.id !== collectionToRemove);

    setCollections(newCollectionList);
    localStorage.setItem('tokenCollections', JSON.stringify(newCollectionList));
  }, [collections]);

  // reset collections if we can't add another except uniqueCollectionId
  useEffect(() => {
    if (!canAddCollections) {
      localStorage.setItem('tokenCollections', JSON.stringify([]));
    }
  }, []);

  return (
    <div className='my-tokens'>
      { !location.pathname.includes('token-details') && !location.pathname.includes('manage-') && (
        <>
          <Header as='h1'>My NFTs</Header>
          <Header as='h4'>NFTs owned by me</Header>
        </>
      )}
      { (!isApiReady || !isApiConnected) && (
        <div className='accounts-preloader'>
          <Loader
            active
          >
            Loading data from chain...
          </Loader>
        </div>
      )}
      { (isApiReady && isApiConnected) && (
        <Switch>
          <Route path={`${basePath}/token-details`}>
            <NftDetails
              account={account || ''}
            />
          </Route>
          <Route path={basePath}>
            <NftWallet
              account={account}
              addCollection={addCollection}
              collections={collections}
              openPanel={openPanel}
              removeCollectionFromList={removeCollectionFromList}
              setCollections={setCollections}
              setOpenPanel={setOpenPanel}
              setShouldUpdateTokens={setShouldUpdateTokens}
              shouldUpdateTokens={shouldUpdateTokens}
            />
          </Route>
        </Switch>
      )}
    </div>
  );
}

export default React.memo(PageNftWallet);
