import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import path from 'path';
import fs from 'fs/promises';
import { ShopService } from '../../shop.service';
import { ClothingItem } from '@typings/lobby/dev/clothing';
import ShopModel from '@typings/models/shop';
import { SseService } from '@/modules/sse/sse.service';
export { ClothingItem };
import { spawn } from 'child_process';
import type LobbyModel from '@typings/models/lobby';

function parseArgsStringToArgv(
  value: string,
  env?: string,
  file?: string,
): string[] {
  // ([^\s'"]([^\s'"]*(['"])([^\3]*?)\3)+[^\s'"]*) Matches nested quotes until the first space outside of quotes

  // [^\s'"]+ or Match if not a space ' or "

  // (['"])([^\5]*?)\5 or Match "quoted text" without quotes
  // `\3` and `\5` are a backreference to the quote style (' or ") captured
  const myRegexp =
    /([^\s'"]([^\s'"]*(['"])([^\3]*?)\3)+[^\s'"]*)|[^\s'"]+|(['"])([^\5]*?)\5/gi;
  const myString = value;
  const myArray: string[] = [];
  if (env) {
    myArray.push(env);
  }
  if (file) {
    myArray.push(file);
  }
  let match: RegExpExecArray | null;
  do {
    // Each call to exec returns the next regex match as an array
    match = myRegexp.exec(myString);
    if (match !== null) {
      // Index 1 in the array is the captured group if it exists
      // Index 0 is the matched text, which we use if no captured group exists
      myArray.push(firstString(match[1], match[6], match[0])!);
    }
  } while (match !== null);

  return myArray;
}

// Accepts any number of arguments, and returns the first one that is a string
// (even an empty string)
function firstString(...args: Array<any>): string | undefined {
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (typeof arg === 'string') {
      return arg;
    }
  }
}

async function run(command: string) {
  return new Promise((resolve) => {
    const args = parseArgsStringToArgv(command);
    const cmd = args.shift();
    if (!cmd) throw new Error('No command');

    const step = spawn(cmd, args, {
      cwd: path.resolve(process.cwd(), '..', '..'),
    });

    step.stdout.pipe(process.stdout);
    step.stderr.pipe(process.stderr);

    step.on('close', (code) => {
      resolve(code);
    });
  });
}

const CONFIG_FILE_PATH = path.resolve(
  process.cwd(),
  '..',
  'client/public/assets/penguin/dev/clothing-items.json',
);

const SHOP_FILE_PATH = path.resolve(
  process.cwd(),
  'src/assets/shop/clothing/{category}/items.json',
);

@Injectable()
export class DevClothingListService {
  private readonly cache: Map<number, ClothingItem> = new Map();
  private readonly logger: Logger = new Logger(DevClothingListService.name);
  constructor(
    private readonly shopService: ShopService,
    private readonly sseService: SseService,
  ) {
    this.loadConfigFile();
  }

  private async loadConfigFile() {
    const raw = await fs.readFile(CONFIG_FILE_PATH, 'utf-8');
    const data = JSON.parse(raw) as Omit<ClothingItem, 'in_shop' | 'shop'>[];
    for await (const entry of data) {
      const shopItem = await this.shopService.getItem(`cloth:${entry.id}`);

      this.cache.set(entry.id, {
        ...entry,
        in_shop: !!shopItem,
      });
      if (shopItem) {
        const item = this.cache.get(entry.id)!;
        item.shop = {
          price: shopItem.price,
          description: shopItem.description,
          subCategory:
            shopItem.subCategory as LobbyModel.Models.InventoryCategory,
        };
      }
    }
  }

  public getList(): ClothingItem[] {
    return [...this.cache.values()];
  }

  public async updateItem(id: number, data: ClothingItem): Promise<void> {
    if (await this.shopService.getItem(`cloth:${id}`))
      throw new ForbiddenException('Item is already in the shop');
    try {
      const itemsInCategory = JSON.parse(
        await fs.readFile(
          SHOP_FILE_PATH.replace('{category}', data.shop!.subCategory),
          'utf-8',
        ),
      ) as ShopModel.Models.Item[];

      const item: ShopModel.Models.Item = {
        id: `cloth:${id}`,
        type: ShopModel.Models.ItemType.Normal,
        flags: [],
        category: 'clothing',
        subCategory: data.shop!.subCategory,
        label: data.name,
        description: data.shop!.description,
        meta: {
          clothId: id,
          ICON: `{ASSET_PATH}/${id}/icon.webp`,
          PREVIEW_PAPER: `{ASSET_PATH}/${id}/paper.webp`,
        },
        listingMeta: {
          previewUrl: `{ASSET_PATH}/${id}/icon.webp`,
        },
        price: data.shop!.price,
      };
      await run(
        `make client_gen_clothing id=${id} ${
          data.props.back_item ? 'back=true' : ''
        }`,
      );
      itemsInCategory.push(item);
      await fs.writeFile(
        SHOP_FILE_PATH.replace('{category}', data.shop!.subCategory),
        JSON.stringify(itemsInCategory, undefined, 2),
        'utf-8',
      );
      this.shopService.parser.config.items[item.id] = item;
      this.shopService.parser.config.subCategories[item.subCategory].items.push(
        item.id,
      );
      this.cache.set(id, {
        ...this.cache.get(id)!,
        in_shop: true,
        shop: (await this.shopService.getItem(`cloth:${id}`))!,
      });
      this.logger.verbose(`Added item ${item.label} (${item.id}) to the shop!`);
      this.sseService.emitToAll('shop-sync', undefined);
    } catch (e) {
      console.error(e);
      throw e;
    }
  }
}
