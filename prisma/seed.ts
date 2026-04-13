import { PrismaClient, Role, SwitchState } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const home = await prisma.home.create({
    data: {
      name: "Demo Home",
      users: {
        create: [{ email: "owner@demo.com", name: "Owner", role: Role.OWNER }]
      },
      rooms: {
        create: [
          {
            name: "Living Room",
            devices: {
              create: [
                {
                  name: "Main Light",
                  type: "light",
                  switches: {
                    create: [
                      { name: "Power", state: SwitchState.OFF },
                      { name: "Night Mode", state: SwitchState.OFF }
                    ]
                  }
                }
              ]
            }
          }
        ]
      }
    }
  });

  console.log(`Seeded home ${home.name}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
