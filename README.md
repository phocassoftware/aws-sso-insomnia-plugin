# AWS SSO Insomnia Plugin

A small plugin to retrieve AWS SSO credentials for signing IAMv4 authenticated requests.

### Prerequisites

- [AWS CLI V2](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html)
- An AWS account with [SSO sign-on](https://docs.aws.amazon.com/singlesignon/latest/userguide/getting-started.html) enabled
- An [SSO named profile](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-sso.html) configured using the AWS CLI

### Usage

If the prerequisites have been satisfied you should be able to perform an SSO login using:

`aws sso login --profile <YOUR PROFILE>`

To use the plugin within Insomnia, select the `AWS` authentication type for your request.

The plugin is to be used from within the `ACCESS KEY ID`, `SECRET ACCESS KEY`, and `SESSION TOKEN` fields:

Within a selected field, type `aws` and wait for autocomplete to provide variable suggestions. You should be able to select `AWS SSO` to fill in the field.

![Field Auto Complete](https://raw.githubusercontent.com/phocassoftware/aws-sso-insomnia-plugin/main/images/readme/field-autocomplete.png)

Once you have populated a field, you can edit it by clicking on it. You need to select both a profile and an item for each tag.

Make sure you select the item that corresponds to the field you are editing (e.g. if you are editing the `ACCESS KEY ID` field, make sure to select `Access Key Id` as the item.)

You can hardcode the profile per field if you wish, but it is much more ergonomic to use an Insomnia environment variable. You can select an environment variable by clicking the gear icon next to the `Profile` dialog.

Once configured you shouldn't need to adjust your individual fields. If you have used an environment variable for the profile, changing it will propagate through all of your requests configured to use this plugin.

![Tag Editing](https://raw.githubusercontent.com/phocassoftware/aws-sso-insomnia-plugin/main/images/readme/tag-editing.png)
