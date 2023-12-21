import UsersModel from '@typings/models/users';
import User from '../..';
import UserExtBase from '../Base';

class UserExtCharacter extends UserExtBase {
  constructor(user: User) {
    super(user);
  }

  get clothes(): UsersModel.Models.ICharacter['clothes'] {
    return this.user.get('character.clothes');
  }
  get color(): number {
    return this.user.get('character.clothes.color');
  }

  async updateColor(color: number): Promise<void> {
    await this.updateClothes({ color });
  }
  async updateCloth(
    piece: keyof UsersModel.Models.ICharacter['clothes'],
    id: number,
  ): Promise<void> {
    await this.updateClothes({ [piece]: id });
  }
  async updateClothes(
    clothes: Partial<UsersModel.Models.ICharacter['clothes']>,
    save: boolean = true,
  ): Promise<void> {
    if (save)
      await this.helpers.db.users.update(this.user.id, {
        character: {
          update: {
            clothes: {
              ...this.clothes,
              ...clothes,
            },
          },
        },
      });
    this.user.set('character.clothes', (prev) => ({
      ...prev,
      ...clothes,
    }));
  }
}

export default UserExtCharacter;
