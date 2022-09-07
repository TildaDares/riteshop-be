import UserModel from "@/resources/user/user.model";
import { createToken } from "@/utils/token";
import User from "@/resources/user/user.interface";
import NewPassword from "@/utils/interfaces/newPassword.interface"

class UserService {
  private user = UserModel;

  public async register(
    name: string,
    email: string,
    password: string,
  ): Promise<string | Error> {
    try {
      const user = await this.user.create({
        name,
        email,
        password,
      });

      await user.save();

      return createToken(user);
    } catch (error) {
      throw new Error("Unable to create user");
    }
  }

  public async login(email: string, password: string) {
    try {
      const user = await this.user.findOne({ email });

      if (!user) {
        throw new Error("User not found");
      }

      const isValidPassword = await user.isValidPassword(password);

      if (!isValidPassword) {
        throw new Error("Invalid login credentials");
      }

      return createToken(user);
    } catch (error) {
      throw new Error("Unable to login");
    }
  }

  public async createAdmin(name: string, email: string, password: string) {
    try {
      const user = await this.user.create({
        name,
        email,
        password,
        role: 'admin',
      });

      await user.save();

      return createToken(user);
    } catch (error) {
      throw new Error("Unable to create user");
    }
  }

  public async getUserById(id: string) {
    try {
      const user = await this.user.findById(id, { password: 0 });

      if (!user) {
        throw new Error("User not found");
      }
      return user
    } catch (error) {
      throw new Error("Unable to get user");
    }
  }

  public async update(id: string, userUpdate: User) {
    try {
      const updatedUser = await this.user.findByIdAndUpdate(id, userUpdate, { new: true }).select('-password').exec();

      if (!updatedUser) {
        throw new Error("Unable to update user");
      }
      return updatedUser
    } catch (error) {
      throw new Error("Unable to update user");
    }
  }

  public async changePassword(id: string, body: NewPassword) {
    try {
      const { oldPassword, newPassword, confirmNewPassword } = body
      if (newPassword !== confirmNewPassword) {
        throw new Error('New Password and Confirm New Password does not match')
      }

      const user = await this.user.findById(id);

      if (!user) {
        throw new Error('User not found')
      }

      const isValidPassword = await user.isValidPassword(oldPassword)
      if (!isValidPassword) {
        throw new Error('Old password is incorrect')
      }

      user.password = newPassword
      await user.save()
      return user
    } catch (error) {
      throw new Error(error.message)
    }
  }

  public async delete(id: string) {
    try {
      const user = await this.user.findByIdAndDelete(id);

      if (!user) {
        throw new Error("Unable to delete user");
      }
    } catch (error) {
      throw new Error("Unable to delete user");
    }
  }
}

export default UserService;
