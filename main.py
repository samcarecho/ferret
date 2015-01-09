import random
import re

import endpoints
from protorpc import remote
from protorpc import messages
from protorpc import message_types
import logging

from tf_api_messages import UserResponseMessage
from tf_api_messages import UserRequestMessage
from tf_api_messages import GetUserRequestMessage
from tf_api_messages import VoteRequestMessage
from tf_api_messages import VoteResponseMessage
from tf_api_messages import UserVotesRequestMessage
from tf_api_messages import VotesListResponse
from tf_api_messages import TokenRequestMessage
from tf_api_messages import TokenResponseMessage

from models import Users
from models import Votes
from models import TokensFB


package = 'TrustFerret'

WEB_CLIENT_ID = 'AIzaSyDIaoLnW0qEdm_jVquJBPBexB-i7qY5Daw'

ID_RESOURCE = endpoints.ResourceContainer(
    message_types.VoidMessage,
    id=messages.IntegerField(1, variant=messages.Variant.UINT64),
    limit=messages.IntegerField(2, variant=messages.Variant.INT32, default=10))

USERDATA_RESOURCE = endpoints.ResourceContainer(
    message_types.VoidMessage,
    userData=messages.StringField(1, variant=messages.Variant.STRING, required=True))

VOTE_RESOURCE = endpoints.ResourceContainer(
    message_types.VoidMessage,
    userID = messages.IntegerField(1, variant=messages.Variant.UINT64, required=True),
    friendID = messages.IntegerField(2, variant=messages.Variant.UINT64, required=True),
    vote = messages.StringField(3, variant=messages.Variant.STRING, required=True))

TOKEN_RESOURCE = endpoints.ResourceContainer(
    TokenRequestMessage)
    #authResponse = messages.StringField(1, variant=messages.Variant.STRING, required=True))


@endpoints.api(name='trustferret', version='v2')
class TrustFerretApi(remote.Service):
    """TrustFerret API v2."""

    @endpoints.method(ID_RESOURCE, UserResponseMessage,
                      path='user/{id}', http_method='GET',
                      name='user.get')
    def user_get(self, request):
        entity = Users.query_current_user(request.id)
        if entity is None:
            raise endpoints.NotFoundException('%s is not a user!' % request.id)
        return entity.to_message()

    @endpoints.method(USERDATA_RESOURCE, UserResponseMessage,
                      path='user/add/{userData}', http_method='GET',
                      name='user.insert')
    def user_insert(self, request):
        """Exposes an API endpoint to insert the current user.

        Args:
            request: An instance of UserRequestMessage parsed from the API
                request.

        Returns:
            An instance of UserResponseMessage containing the user details.
        """
        entity = Users.put_from_message(request)
        return entity.to_message()

    @endpoints.method(ID_RESOURCE, VotesListResponse,
                      path='votes/{id}/{limit}', http_method='GET',
                      name='votes.list')
    def votes_list(self, request):
        """Exposes an API endpoint to query for votes casted by the current user.

        Args:
            request: An instance of UserVotesRequestMessage parsed from the API
                request.

        Returns:
            An instance of UserVotesResponseMessage containing the votes for the
            current user returned in the query. If the API request specifies an
            order of friend ID (the default).
        """
        query = Votes.query_current_user_votes(request)
        #TODO: implement query.fetch_page() (https://developers.google.com/appengine/docs/python/ndb/queryclass#Query_fetch_page)
        items = [entity.votes_to_message() for entity in query.fetch(5000)]
        #print items
        return VotesListResponse(votes=items)

    @endpoints.method(VOTE_RESOURCE, VoteResponseMessage,
                      path='vote/{userID}/{friendID}/{vote}', http_method='GET',
                      name='vote.insert')
    def vote_insert(self, request):
        """Exposes an API endpoint to insert a vote casted by the current user.

        Args:
            request: An instance of VoteRequestMessage parsed from the API
                request.

        Returns:
            An instance of UserVotesResponseMessage containing a success message.
        """
        logging.info(request.friendID)
        entity = Votes.put_from_message(request)
        #print entity
        return entity.to_message()

    @endpoints.method(TOKEN_RESOURCE, TokenResponseMessage,
                      path='tk/', http_method='GET',
                      name='token.insert')
    def token_insert(self, request):
        """Exposes an API endpoint to insert a user token casted by the current user.

        Args:
            request: An instance of TokenRequestMessage parsed from the API
                request.

        Returns:
            An instance of TokenResponseMessage containing a success message.
        """
        entity = TokensFB.put_from_message(request)
        #print entity
        return entity.to_message()


APP = endpoints.api_server([TrustFerretApi],
                           restricted=False)






"""
class Handler(webapp2.RequestHandler):
    def write(self, *a, **kw):
        self.response.out.write(*a, **kw)
    def render_str(self, template, **params):
        t = jinja_env.get_template(template)
        return t.render(params)
    def render(self, template, **kw):
        self.write(self.render_str(template, **kw))


class MainHandler(Handler):
    def get(self, actor, action):

        resp = {'actor': actor, 'action': action}
        #self.response.write('Hello world!')
        self.response.headers['Content-Type'] = 'application/json'
        self.write(json.dumps(resp))


APP = webapp2.WSGIApplication([
    webapp2.Route(r'/rpc/<actor>/<action>', handler=MainHandler, name='actor, action')
], debug=True)
"""