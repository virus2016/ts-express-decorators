import {Inject, Intercept, Service} from "@tsed/common";
import {PermissionInterceptor} from "../interceptors/PermissionInterceptor";
import {CustomFactory} from "./CustomFactory";
import {SanitizeService} from "./SanitizeService";

@Service()
export class TokenService {

    private _token: string = "EMPTY";

    constructor(private sanitize: SanitizeService,
                @Inject(CustomFactory) private customFactory: CustomFactory) {

    }

    @Intercept(PermissionInterceptor)
    method() {

    }

    token(token?: string) {
        if (token) {
            this._token = token;
        }

        return this._token;
    }
}