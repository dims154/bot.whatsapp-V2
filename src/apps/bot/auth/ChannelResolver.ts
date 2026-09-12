import { prismaService } from "../../../database/prisma.service";

export class ChannelResolver {
  static async resolveByPhoneNumberId(
    phoneNumberId: string
  ): Promise<{
    channelId: string;
    businessId: string;
    tenantId: string;
  } | null> {
    if (!phoneNumberId) {
      console.warn("phoneNumberId kosong.");
      return null;
    }

    const channels = await prismaService.client.channel.findMany({
      where: {
        active: true,
        provider: {
          type: "meta-cloud",
          active: true,
        },
      },
      include: {
        business: true,
        provider: true,
      },
    });

    for (const channel of channels) {
      const configuration = channel.configuration as Record<
        string,
        unknown
      > | null;

      if (
        configuration?.phoneNumberId === phoneNumberId ||
        configuration?.phone_number_id === phoneNumberId
      ) {
        return {
          channelId: channel.id,
          businessId: channel.businessId,
          tenantId: channel.business.tenantId,
        };
      }
    }

    console.warn(
      `Channel tidak ditemukan untuk phoneNumberId: ${phoneNumberId}`
    );

    return null;
  }
}
