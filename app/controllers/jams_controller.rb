class JamsController < ApplicationController
  respond_to :json

  def index
    respond_to do |format|
      format.json { render json: { jams: current_user.jams } }
    end
  end

  def new
    binding.pry
    @jam = Jam.new
  end
  # def create
  #   @friend = User.find(params[:id])
  #   if current_user == @friend
  #     respond_to do |format|
  #       format.json { render json: { errors: "You can't friend yourself"}, status: 403 }
  #     end
  #   else
  #     @new_friend = Friend.new(user: current_user, friend_id: @friend.to_param)
  #     if @new_friend.save
  #       respond_to do |format|
  #         format.json { render json: @new_friend }
  #       end
  #     else
  #       respond_to do |format|
  #         format.json { render json: { errors: "#{@friend.user_name} is alredy your friend" }, status: 403 }
  #       end
  #     end
  #   end
  # end

  # def destroy
  #   # UserRadio.destroy_all(user: current_user, radio_id: params[:id])
  #   # respond_to do |format|
  #   #   format.json { render json: { id: params[:id], message: "The radio was deleted" } }
  #   # end
  # end
end
