import { AppScope, ChannelScope } from '@skyway-sdk/token';
import { Base64Url } from '../util/base64url';
import { CryptoUtil } from '../util/crypto-util';
import { UUID } from '../util/uuid';

type ChannelName = string;

export namespace SkyWayAuthToken {
  /**
   * SkyWayAuthTokenを生成.
   * 
   * **シークレットキーはフロントエンドに対して秘匿されている必要があります. この実装をフロントエンド環境に流用しないでください.**
   * 
   * サーバを構築せずにフロントエンドでSkyWayAuthTokenを生成した場合、
   * シークレットキーをユーザが取得できるため、誰でも任意のChannelやRoomを生成して参加できる等のセキュリティ上の問題が発生します.
   * 
   * @param appId アプリケーションID
   * @param secret シークレットキー
   * @param channelName 接続するチャンネルの名称
   * @param lobbySize ユドナリウムで利用できるロビーの広さ
   * @param peerId PeerId
   * @param jti "JWT ID". JWTのユニーク値
   * @param iat "Issued At Time". JWTが発行された日時(Unix Timestamp)
   * @returns JWT
   */
  export async function create(
    appId: string, secret: string, lobbySize: number,
    channelName: string, peerId: string,
    jti: string = UUID.randomV4(), iat: number = Math.floor(Date.now() / 1000)
  ): Promise<string> {
    if (channelName.startsWith('udonarium-lobby-') || channelName.includes('*') || peerId.includes('*')) {
      throw new Error('Invalid Argument');
    }

    const channelMap: Map<ChannelName, ChannelScope> = new Map();
    channelMap.set(channelName, {
      name: channelName,
      actions: ['read', 'create'],
      members: [
        {
          name: peerId,
          actions: ['write'],
          publication: {
            actions: ['write'],
          },
          subscription: {
            actions: ['write'],
          },
        },
        {
          name: '*',
          actions: ['signal'],
        },
      ],
    });

    const lobbyName = `udonarium-lobby-*-of-${lobbySize}`;
    channelMap.set(lobbyName, {
      name: lobbyName,
      actions: ['read', 'create'],
      members: [
        {
          name: peerId,
          actions: ['write'],
        },
      ],
    });

    const header = { alg: 'HS256', typ: 'JWT' };

    const scope: { app: AppScope } = {
      app: {
        id: appId,
        turn: true,
        actions: ['read'],
        channels: Array.from(channelMap.values()),
      }
    };

    const payload = {
      jti: jti,
      iat: iat,
      exp: iat + 60 * 60 * 24,
      version: 2,
      scope: scope,
    };

    const jwtHeader = Base64Url.encode(JSON.stringify(header));
    const jwtPayload = Base64Url.encode(JSON.stringify(payload));
    const jwtSignature = Base64Url.encode(await CryptoUtil.hmacSHA256(jwtHeader + '.' + jwtPayload, secret));
    const token = jwtHeader + '.' + jwtPayload + '.' + jwtSignature;

    return token;
  }
}
