import { NgModule } from '@angular/core';
import { APOLLO_OPTIONS, ApolloModule } from 'apollo-angular';
import { HttpLink, HttpLinkModule } from 'apollo-angular-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloLink } from 'apollo-link';
import { setContext } from 'apollo-link-context';
import { AUTH_TYPE, createAppSyncLink } from 'aws-appsync';

import { CasTicketService } from './services';

export function createApollo(httpLink: HttpLink, cas: CasTicketService) {
  const url = 'https://attendix.apu.edu.my/graphql';
  const link = createAppSyncLink({
    url,
    region: 'ap-southeast-1',
    auth: {
      type: AUTH_TYPE.API_KEY,
      apiKey: 'da2-dv5bqitepbd2pmbmwt7keykfg4'
    },
    complexObjectsCredentials: null,
    // use "ticket" header for custom authentication
    resultsFetcherLink: ApolloLink.from([
      setContext(async (_request, previousContext: Record<string, any>) => ({
        headers: {
          ...previousContext.headers,
          ticket: await cas.getST('https://api.apiit.edu.my/attendix').toPromise()
        }
      })),
      httpLink.create({ uri: url })
    ]),
  });

  return { cache: new InMemoryCache(), link };
}

@NgModule({
  exports: [ApolloModule, HttpLinkModule],
  providers: [
    {
      provide: APOLLO_OPTIONS,
      useFactory: createApollo,
      deps: [HttpLink, CasTicketService],
    },
  ],
})
export class GraphQLModule { }
