module.exports = function (app , controller) {
    app.get( controller.getUrl('/invitations/:token') , controller.invitations.retrieve);
    app.post(controller.getUrl('/invitations/:token'), controller.invitations.verifyInvitationToken);
    app.post(controller.getUrl('/invitations/'), controller.invitations.create);
    app.get(controller.getUrl('/:id/invitation_link'), controller.requireAuthentication , controller.invitations.generateInvitationLink);
};