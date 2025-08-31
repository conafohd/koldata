import type { UserInfos } from "@/models/interfaces/UserInfos";
import { i18n } from "@/plugins/i18n";

export class EmailTemplateService {
  static getAssociationCreationRequestTemplate(userInfos: UserInfos): Record<string, string> {
    const RECIPIENT_EMAIL = "o_ribiere@cartong.org"
    console.log()
    return {
        to: RECIPIENT_EMAIL,
        subject: encodeURIComponent(i18n.t('email.createAssociationRequest.subject')),
        body: encodeURIComponent(i18n.t('email.createAssociationRequest.body', {
          last_name: userInfos.last_name,
          first_name: userInfos.first_name,
          email: userInfos.email
        }))
    }
  }
}
